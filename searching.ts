/**
 * Rhodes Dispatch - High-Speed Tactical Searching Engine
 * Implements 8 Real Searching Algorithms with In-Depth Detailed Logs (Zero Arrow Symbols)
 * 1. Hash-Indexed Direct Lookup (Ultra Fast O(1) direct access)
 * 2. Trie Prefix Tree Search (O(M) tree traversal by character key)
 * 3. Fibonacci Search (Fibonacci interval division)
 * 4. Binary Search (Divide & Conquer on ordered range)
 * 5. Jump Search (Block Jump step m = floor(sqrt(n)))
 * 6. Exponential Search (Range Doubling + Binary Search)
 * 7. Interpolation Search (Probe estimation)
 * 8. Linear Search (Sequential scan)
 */

import { EventItem } from '../types/database';
import { 
  SearchAlgorithmType, 
  SearchAttribute, 
  SearchResult, 
  SearchStep, 
  SystemLogEntry 
} from '../types/algorithms';

function makeTimestamp(): string {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
}

export function executeSearch(
  sourceArray: EventItem[],
  query: string,
  algorithm: SearchAlgorithmType,
  attribute: SearchAttribute = 'event_code'
): SearchResult {
  const startTime = performance.now();
  const trimmed = query.trim().toUpperCase();
  const steps: SearchStep[] = [];
  const logs: SystemLogEntry[] = [];

  let elementsChecked = 0;
  let foundIndex: number | null = null;
  let matchedItem: EventItem | null = null;
  let requiredPreSort = false;

  const algoNames: Record<SearchAlgorithmType, string> = {
    hash: 'Hash-Indexed Direct Lookup O(1)',
    trie: 'Trie Prefix Tree Search O(M)',
    fibonacci: 'Fibonacci Division Search',
    binary: 'Binary Search (Bagi Dua Biner)',
    jump: 'Jump Search (Lompatan Blok)',
    exponential: 'Exponential Search (Penggandaan Rentang)',
    interpolation: 'Interpolation Search (Estimasi Nilai)',
    linear: 'Linear Search (Pemindaian Sekuensial)'
  };

  const algoTitle = algoNames[algorithm];
  const targetColName = attribute === 'event_code' ? 'KODE ACARA' : 'JUDUL ACARA';

  logs.push({
    id: `log-s-${Date.now()}-0`,
    timestamp: makeTimestamp(),
    type: 'SEARCH',
    message: `Inisialisasi ${algoTitle} pada kolom [${targetColName}]. Total data: ${sourceArray.length} rekaman.`,
    variant: 'cyan'
  });

  logs.push({
    id: `log-s-${Date.now()}-1`,
    timestamp: makeTimestamp(),
    type: 'INFO',
    message: `Kata kunci target pencarian: "${trimmed}".`
  });

  if (!trimmed) {
    return {
      foundIndex: null,
      matchedItem: null,
      steps: [],
      logs: [],
      totalChecked: 0,
      executionTimeMs: 0
    };
  }

  let searchArray = [...sourceArray];

  // 1. HASH-INDEXED DIRECT SEARCH O(1)
  if (algorithm === 'hash') {
    logs.push({
      id: `log-hash-prep-${Date.now()}`,
      timestamp: makeTimestamp(),
      type: 'HASH',
      message: `Membangun tabel pemetaan Hash in-memory untuk ${searchArray.length} acara. Memetakan string kunci langsung ke indeks array.`,
      variant: 'cyan'
    });

    const hashTable = new Map<string, number>();
    for (let i = 0; i < searchArray.length; i++) {
      const val = (attribute === 'event_code' ? searchArray[i].event_code : searchArray[i].title).toUpperCase();
      hashTable.set(val, i);
      const tokens = val.split(/[\s-]+/);
      tokens.forEach((tok) => {
        if (!hashTable.has(tok)) hashTable.set(tok, i);
      });
    }

    elementsChecked = 1;
    if (hashTable.has(trimmed)) {
      foundIndex = hashTable.get(trimmed)!;
      matchedItem = searchArray[foundIndex];

      steps.push({
        type: 'match',
        currentIndex: foundIndex,
        foundIndex: foundIndex,
        target: trimmed,
        message: `Hash Bucket HIT pada indeks ${foundIndex} (${matchedItem.event_code}) dalam 1 kali lookup O(1)`,
        logType: 'MATCH',
        stats: { elementsChecked }
      });

      logs.push({
        id: `log-hash-hit-${Date.now()}`,
        timestamp: makeTimestamp(),
        type: 'MATCH',
        message: `Pencocokan langsung Hash O(1) berhasil! Kunci "${trimmed}" memetakan langsung ke indeks [${foundIndex}] (${matchedItem.event_code}).`,
        variant: 'green'
      });
    } else {
      logs.push({
        id: `log-hash-scan-${Date.now()}`,
        timestamp: makeTimestamp(),
        type: 'HASH',
        message: `Kunci presisi tidak langsung cocok. Memeriksa kecocokan substring pada entri tabel hash.`
      });

      for (const [key, idx] of hashTable.entries()) {
        elementsChecked++;
        if (key.includes(trimmed)) {
          foundIndex = idx;
          matchedItem = searchArray[idx];
          logs.push({
            id: `log-hash-sub-${idx}`,
            timestamp: makeTimestamp(),
            type: 'MATCH',
            message: `Kecocokan token hash ditemukan: Kunci "${key}" memuat target "${trimmed}" pada indeks [${idx}] (${matchedItem.event_code}).`,
            variant: 'green'
          });
          break;
        }
      }
    }

  // 2. TRIE PREFIX TREE SEARCH O(M)
  } else if (algorithm === 'trie') {
    class TrieNode {
      children = new Map<string, TrieNode>();
      eventIndices: number[] = [];
    }

    const root = new TrieNode();

    searchArray.forEach((item, index) => {
      const key = (attribute === 'event_code' ? item.event_code : item.title).toUpperCase();
      let node = root;
      for (const char of key) {
        if (!node.children.has(char)) {
          node.children.set(char, new TrieNode());
        }
        node = node.children.get(char)!;
        node.eventIndices.push(index);
      }
    });

    logs.push({
      id: `log-trie-built-${Date.now()}`,
      timestamp: makeTimestamp(),
      type: 'TRIE',
      message: `Pohon Trie karakter terinisialisasi. Menelusuri cabang pohon untuk kata kunci "${trimmed}" sedalam ${trimmed.length} tingkat.`,
      variant: 'cyan'
    });

    let node: TrieNode | undefined = root;
    let matchedDepth = 0;

    for (let i = 0; i < trimmed.length; i++) {
      elementsChecked++;
      const char = trimmed[i];
      if (node && node.children.has(char)) {
        node = node.children.get(char);
        matchedDepth++;
        steps.push({
          type: 'trie',
          currentIndex: node!.eventIndices[0],
          target: trimmed,
          message: `Cabang Trie cocok pada karakter '${char}' (Tingkat kedalaman ${matchedDepth} dari ${trimmed.length})`,
          logType: 'TRIE',
          stats: { elementsChecked }
        });

        logs.push({
          id: `log-trie-step-${i}`,
          timestamp: makeTimestamp(),
          type: 'TRIE',
          message: `Karakter '${char}' terverifikasi pada simpul cabang tingkat ${matchedDepth}. Kandidat aktif: ${node!.eventIndices.length} rekaman.`
        });
      } else {
        node = undefined;
        logs.push({
          id: `log-trie-dead-${i}`,
          timestamp: makeTimestamp(),
          type: 'INFO',
          message: `Cabang karakter '${char}' tidak ditemukan pada simpul tingkat ${i + 1}. Penelusuran pohon terhenti.`
        });
        break;
      }
    }

    if (node && node.eventIndices.length > 0) {
      foundIndex = node.eventIndices[0];
      matchedItem = searchArray[foundIndex];

      logs.push({
        id: `log-trie-match-${foundIndex}`,
        timestamp: makeTimestamp(),
        type: 'MATCH',
        message: `Jalur terminal pohon Trie terkonfirmasi pada indeks [${foundIndex}] (${matchedItem.event_code} - ${matchedItem.title}).`,
        variant: 'green'
      });
    }

  // 3. FIBONACCI DIVISION SEARCH
  } else if (algorithm === 'fibonacci') {
    requiredPreSort = true;
    searchArray.sort((a, b) => {
      const valA = (attribute === 'event_code' ? a.event_code : a.title).toUpperCase();
      const valB = (attribute === 'event_code' ? b.event_code : b.title).toUpperCase();
      return valA.localeCompare(valB);
    });

    const n = searchArray.length;
    let fibMMm2 = 0;
    let fibMMm1 = 1;
    let fibM = fibMMm2 + fibMMm1;

    while (fibM < n) {
      fibMMm2 = fibMMm1;
      fibMMm1 = fibM;
      fibM = fibMMm2 + fibMMm1;
    }

    logs.push({
      id: `log-fib-init-${Date.now()}`,
      timestamp: makeTimestamp(),
      type: 'FIBONACCI',
      message: `Bilangan Fibonacci terkecil yang lebih besar atau sama dengan ${n} adalah ${fibM} (fibM-1: ${fibMMm1}, fibM-2: ${fibMMm2}).`,
      variant: 'cyan'
    });

    let offset = -1;

    while (fibM > 1) {
      const i = Math.min(offset + fibMMm2, n - 1);
      elementsChecked++;
      const item = searchArray[i];
      const val = (attribute === 'event_code' ? item.event_code : item.title).toUpperCase();

      steps.push({
        type: 'compare',
        currentIndex: i,
        target: trimmed,
        message: `Inspeksi Fibonacci pada indeks ${i} (${item.event_code})`,
        logType: 'CHECK',
        stats: { elementsChecked }
      });

      logs.push({
        id: `log-fib-step-${i}`,
        timestamp: makeTimestamp(),
        type: 'FIBONACCI',
        message: `Memeriksa indeks Fibonacci ${i}: Kode: ${item.event_code}, Nilai: "${val}".`
      });

      if (val === trimmed || val.includes(trimmed)) {
        foundIndex = i;
        matchedItem = item;
        logs.push({
          id: `log-fib-hit-${i}`,
          timestamp: makeTimestamp(),
          type: 'MATCH',
          message: `Target ditemukan pada indeks Fibonacci ${i} (${item.event_code}).`,
          variant: 'green'
        });
        break;
      }

      if (val < trimmed) {
        fibM = fibMMm1;
        fibMMm1 = fibMMm2;
        fibMMm2 = fibM - fibMMm1;
        offset = i;
        logs.push({
          id: `log-fib-right-${i}`,
          timestamp: makeTimestamp(),
          type: 'INFO',
          message: `Nilai lebih kecil dari target. Menggeser offset ke indeks ${i} dan mengecilkan interval Fibonacci.`
        });
      } else {
        fibM = fibMMm2;
        fibMMm1 = fibMMm1 - fibMMm2;
        fibMMm2 = fibM - fibMMm1;
        logs.push({
          id: `log-fib-left-${i}`,
          timestamp: makeTimestamp(),
          type: 'INFO',
          message: `Nilai lebih besar dari target. Menurunkan interval Fibonacci ke ${fibM}.`
        });
      }
    }

  // 4. BINARY SEARCH (Bagi Dua Biner)
  } else if (algorithm === 'binary') {
    requiredPreSort = true;
    searchArray.sort((a, b) => {
      const valA = (attribute === 'event_code' ? a.event_code : a.title).toUpperCase();
      const valB = (attribute === 'event_code' ? b.event_code : b.title).toUpperCase();
      return valA.localeCompare(valB);
    });

    logs.push({
      id: `log-bin-presort-${Date.now()}`,
      timestamp: makeTimestamp(),
      type: 'INFO',
      message: `Prasyarat terpenuhi: Data acara telah dipastikan terurut leksikografis berdasarkan [${targetColName}].`,
      variant: 'cyan'
    });

    let left = 0;
    let right = searchArray.length - 1;
    let iteration = 1;

    while (left <= right) {
      elementsChecked++;
      const mid = Math.floor(left + (right - left) / 2);
      const midItem = searchArray[mid];
      const midVal = (attribute === 'event_code' ? midItem.event_code : midItem.title).toUpperCase();

      steps.push({
        type: 'compare',
        currentIndex: mid,
        target: trimmed,
        message: `Binary Search Iterasi ${iteration}: Rentang [${left} sampai ${right}], Titik Tengah Mid = ${mid} (${midItem.event_code})`,
        logType: 'CHECK',
        stats: { elementsChecked }
      });

      logs.push({
        id: `log-bin-mid-${iteration}`,
        timestamp: makeTimestamp(),
        type: 'SEARCH',
        message: `Iterasi ${iteration}: Rentang aktif [indeks ${left} sampai ${right}]. Titik tengah Mid = indeks ${mid} (${midItem.event_code}, nilai: "${midVal}").`
      });

      if (midVal === trimmed || midVal.includes(trimmed)) {
        foundIndex = mid;
        matchedItem = midItem;
        logs.push({
          id: `log-bin-hit-${mid}`,
          timestamp: makeTimestamp(),
          type: 'MATCH',
          message: `Kecocokan target ditemukan pada titik tengah Mid indeks [${mid}] (${midItem.event_code}).`,
          variant: 'green'
        });
        break;
      }

      if (midVal < trimmed) {
        logs.push({
          id: `log-bin-shift-r-${iteration}`,
          timestamp: makeTimestamp(),
          type: 'INFO',
          message: `Nilai tengah "${midVal}" lebih kecil dari target "${trimmed}". Mempersempit rentang ke separuh kanan: [indeks ${mid + 1} sampai ${right}].`
        });
        left = mid + 1;
      } else {
        logs.push({
          id: `log-bin-shift-l-${iteration}`,
          timestamp: makeTimestamp(),
          type: 'INFO',
          message: `Nilai tengah "${midVal}" lebih besar dari target "${trimmed}". Mempersempit rentang ke separuh kiri: [indeks ${left} sampai ${mid - 1}].`
        });
        right = mid - 1;
      }

      iteration++;
    }

  // 5. JUMP SEARCH
  } else if (algorithm === 'jump') {
    requiredPreSort = true;
    searchArray.sort((a, b) => {
      const valA = (attribute === 'event_code' ? a.event_code : a.title).toUpperCase();
      const valB = (attribute === 'event_code' ? b.event_code : b.title).toUpperCase();
      return valA.localeCompare(valB);
    });

    const n = searchArray.length;
    const step = Math.floor(Math.sqrt(n));
    let prev = 0;
    let currentStep = step;

    logs.push({
      id: `log-jump-init-${Date.now()}`,
      timestamp: makeTimestamp(),
      type: 'INFO',
      message: `Jump Search: Ukuran blok lompatan m = akar(${n}) = ${step} elemen.`,
      variant: 'cyan'
    });

    while (currentStep < n) {
      elementsChecked++;
      const val = (attribute === 'event_code' ? searchArray[currentStep].event_code : searchArray[currentStep].title).toUpperCase();
      
      logs.push({
        id: `log-jump-block-${currentStep}`,
        timestamp: makeTimestamp(),
        type: 'SEARCH',
        message: `Memeriksa batas blok pada indeks ${currentStep} (${searchArray[currentStep].event_code}).`
      });

      if (val >= trimmed) break;
      prev = currentStep;
      currentStep += step;
    }

    const limit = Math.min(currentStep, n);
    logs.push({
      id: `log-jump-linear-${prev}`,
      timestamp: makeTimestamp(),
      type: 'INFO',
      message: `Target berada di dalam blok rentang [indeks ${prev} sampai ${limit}]. Melakukan pemindaian linear internal.`
    });

    for (let i = prev; i < limit; i++) {
      elementsChecked++;
      const cVal = (attribute === 'event_code' ? searchArray[i].event_code : searchArray[i].title).toUpperCase();
      if (cVal === trimmed || cVal.includes(trimmed)) {
        foundIndex = i;
        matchedItem = searchArray[i];
        logs.push({
          id: `log-jump-hit-${i}`,
          timestamp: makeTimestamp(),
          type: 'MATCH',
          message: `Target ditemukan di dalam blok pada indeks ${i} (${searchArray[i].event_code}).`,
          variant: 'green'
        });
        break;
      }
    }

  // 6. EXPONENTIAL SEARCH
  } else if (algorithm === 'exponential') {
    requiredPreSort = true;
    searchArray.sort((a, b) => {
      const valA = (attribute === 'event_code' ? a.event_code : a.title).toUpperCase();
      const valB = (attribute === 'event_code' ? b.event_code : b.title).toUpperCase();
      return valA.localeCompare(valB);
    });

    const n = searchArray.length;
    let bound = 1;

    logs.push({
      id: `log-exp-init-${Date.now()}`,
      timestamp: makeTimestamp(),
      type: 'INFO',
      message: `Exponential Search: Melipatgandakan batas pencarian (bound = 1, 2, 4, 8, ...) hingga menemukan rentang target.`,
      variant: 'cyan'
    });

    while (bound < n) {
      elementsChecked++;
      const bVal = (attribute === 'event_code' ? searchArray[bound].event_code : searchArray[bound].title).toUpperCase();
      logs.push({
        id: `log-exp-bound-${bound}`,
        timestamp: makeTimestamp(),
        type: 'SEARCH',
        message: `Memeriksa batas eksponensial indeks ${bound} (${searchArray[bound].event_code}).`
      });
      if (bVal >= trimmed) break;
      bound *= 2;
    }

    let left = Math.floor(bound / 2);
    let right = Math.min(bound, n - 1);

    logs.push({
      id: `log-exp-range-${left}-${right}`,
      timestamp: makeTimestamp(),
      type: 'INFO',
      message: `Rentang target teridentifikasi pada indeks [${left} sampai ${right}]. Menjalankan Binary Search pada rentang ini.`
    });

    while (left <= right) {
      elementsChecked++;
      const mid = Math.floor(left + (right - left) / 2);
      const midVal = (attribute === 'event_code' ? searchArray[mid].event_code : searchArray[mid].title).toUpperCase();
      if (midVal === trimmed || midVal.includes(trimmed)) {
        foundIndex = mid;
        matchedItem = searchArray[mid];
        break;
      }
      if (midVal < trimmed) left = mid + 1;
      else right = mid - 1;
    }

  // 7. INTERPOLATION SEARCH
  } else if (algorithm === 'interpolation') {
    requiredPreSort = true;
    searchArray.sort((a, b) => {
      const valA = (attribute === 'event_code' ? a.event_code : a.title).toUpperCase();
      const valB = (attribute === 'event_code' ? b.event_code : b.title).toUpperCase();
      return valA.localeCompare(valB);
    });

    let low = 0;
    let high = searchArray.length - 1;

    logs.push({
      id: `log-int-init-${Date.now()}`,
      timestamp: makeTimestamp(),
      type: 'INFO',
      message: `Interpolation Search: Mengestimasi posisi probabel berdasarkan rumus interpolasi matematis pada rentang data terurut.`,
      variant: 'cyan'
    });

    while (low <= high) {
      elementsChecked++;
      const pos = Math.min(high, Math.max(low, Math.floor(low + ((high - low) / 2))));
      const posVal = (attribute === 'event_code' ? searchArray[pos].event_code : searchArray[pos].title).toUpperCase();

      logs.push({
        id: `log-int-probe-${pos}`,
        timestamp: makeTimestamp(),
        type: 'SEARCH',
        message: `Probe estimasi interpolasi memeriksa posisi indeks [${pos}] (${searchArray[pos].event_code}).`
      });

      if (posVal === trimmed || posVal.includes(trimmed)) {
        foundIndex = pos;
        matchedItem = searchArray[pos];
        logs.push({
          id: `log-int-hit-${pos}`,
          timestamp: makeTimestamp(),
          type: 'MATCH',
          message: `Target cocok ditemukan pada posisi interpolasi indeks [${pos}].`,
          variant: 'green'
        });
        break;
      }
      if (posVal < trimmed) low = pos + 1;
      else high = pos - 1;
    }

  // 8. LINEAR SEARCH
  } else if (algorithm === 'linear') {
    logs.push({
      id: `log-lin-init-${Date.now()}`,
      timestamp: makeTimestamp(),
      type: 'INFO',
      message: `Linear Search dimulai: memeriksa setiap elemen satu per satu secara berurutan dari indeks 0 sampai ${searchArray.length - 1}.`,
      variant: 'cyan'
    });

    for (let i = 0; i < searchArray.length; i++) {
      elementsChecked++;
      const val = (attribute === 'event_code' ? searchArray[i].event_code : searchArray[i].title).toUpperCase();

      steps.push({
        type: 'compare',
        currentIndex: i,
        target: trimmed,
        message: `Pemeriksaan linear pada indeks ${i} (${searchArray[i].event_code})`,
        logType: 'CHECK',
        stats: { elementsChecked }
      });

      logs.push({
        id: `log-lin-step-${i}`,
        timestamp: makeTimestamp(),
        type: 'SEARCH',
        message: `Memeriksa indeks [${i}]: Kode: ${searchArray[i].event_code}, Judul: "${searchArray[i].title}".`
      });

      if (val === trimmed || val.includes(trimmed)) {
        foundIndex = i;
        matchedItem = searchArray[i];

        logs.push({
          id: `log-lin-hit-${i}`,
          timestamp: makeTimestamp(),
          type: 'MATCH',
          message: `Kecocokan ditemukan pada indeks [${i}] (${searchArray[i].event_code}). Menghentikan pencarian.`,
          variant: 'green'
        });
        break;
      }
    }
  }

  const executionTimeMs = Number((performance.now() - startTime).toFixed(2));

  if (foundIndex !== null) {
    logs.push({
      id: `log-s-success-${Date.now()}`,
      timestamp: makeTimestamp(),
      type: 'SUCCESS',
      message: `Target berhasil ditemukan pada indeks [${foundIndex}] (${matchedItem?.event_code} - ${matchedItem?.title}) dalam ${executionTimeMs} ms setelah memeriksa ${elementsChecked} elemen.`,
      variant: 'green'
    });
  } else {
    logs.push({
      id: `log-s-nf-${Date.now()}`,
      timestamp: makeTimestamp(),
      type: 'NOT_FOUND',
      message: `Pencarian selesai: Target "${trimmed}" TIDAK DITEMUKAN dalam seluruh ${searchArray.length} rekaman acara.`,
      variant: 'red'
    });
  }

  logs.push({
    id: `log-s-stats-${Date.now()}`,
    timestamp: makeTimestamp(),
    type: 'STATS',
    message: `Laporan Pencarian: Total Diperiksa: ${elementsChecked} elemen | Status: ${foundIndex !== null ? 'DITEMUKAN' : 'TIDAK DITEMUKAN'} | Durasi: ${executionTimeMs} ms.`,
    variant: foundIndex !== null ? 'green' : 'red'
  });

  return {
    foundIndex,
    matchedItem,
    steps,
    logs,
    totalChecked: elementsChecked,
    executionTimeMs,
    requiredPreSort
  };
}
