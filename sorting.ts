/**
 * Rhodes Dispatch - High-Performance & Tactical Sorting Engine
 * Implements 11 Real Sorting Algorithms with In-Depth Detailed Logs (Zero Arrow Symbols)
 * 1. Radix Sort (Non-comparative digit bucket distribution)
 * 2. Tim Sort (Hybrid insertion + merge sort)
 * 3. Heap Sort (Binary Max/Min Heap)
 * 4. Comb Sort (Gap shrink factor 1.3)
 * 5. Quick Sort (Lomuto Partition & Pivot)
 * 6. Merge Sort (Divide & Conquer Sub-array Merging)
 * 7. Insertion Sort (Contiguous Shifts)
 * 8. Selection Sort (Min/Max Scanning)
 * 9. Bubble Sort (Adjacent Swaps)
 * 10. Shell Sort (Gapped Insertion)
 * 11. Cocktail Shaker Sort (Bidirectional Bubble)
 */

import { EventItem } from '../types/database';
import { 
  SortAlgorithmType, 
  SortAttribute, 
  SortDirection, 
  SortResult, 
  SortStep, 
  SystemLogEntry 
} from '../types/algorithms';

function getComparator(attribute: SortAttribute, direction: SortDirection) {
  const isAsc = direction === 'asc';

  return (a: EventItem, b: EventItem): number => {
    let diff = 0;
    switch (attribute) {
      case 'min_price':
        diff = a.min_price - b.min_price;
        break;
      case 'available_stock':
        diff = a.available_stock - b.available_stock;
        break;
      case 'starts_at':
        diff = new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime();
        break;
      case 'event_code':
        diff = a.event_code.localeCompare(b.event_code, undefined, { numeric: true });
        break;
      case 'title':
        diff = a.title.localeCompare(b.title);
        break;
      default:
        diff = 0;
    }
    return isAsc ? diff : -diff;
  };
}

function getNumericValue(item: EventItem, attribute: SortAttribute): number {
  switch (attribute) {
    case 'min_price':
      return item.min_price;
    case 'available_stock':
      return item.available_stock;
    case 'starts_at':
      return Math.floor(new Date(item.starts_at).getTime() / 1000);
    case 'event_code': {
      const match = item.event_code.match(/\d+/);
      return match ? parseInt(match[0], 10) : item.event_code.charCodeAt(0);
    }
    case 'title':
      return item.title.charCodeAt(0) * 100 + (item.title.charCodeAt(1) || 0);
    default:
      return item.min_price;
  }
}

function getAttrDisplayValue(item: EventItem, attribute: SortAttribute): string {
  switch (attribute) {
    case 'min_price':
      return `Rp ${item.min_price.toLocaleString('id-ID')}`;
    case 'available_stock':
      return `${item.available_stock} kuota`;
    case 'starts_at':
      return new Date(item.starts_at).toLocaleDateString('id-ID', { month: 'short', day: 'numeric', year: 'numeric' });
    case 'event_code':
      return item.event_code;
    case 'title':
      return item.title.length > 22 ? item.title.substring(0, 22) + '...' : item.title;
    default:
      return '';
  }
}

function makeTimestamp(): string {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
}

export function executeSorting(
  sourceArray: EventItem[],
  algorithm: SortAlgorithmType,
  attribute: SortAttribute,
  direction: SortDirection
): SortResult {
  const startTime = performance.now();
  let arr: EventItem[] = [...sourceArray];
  const steps: SortStep[] = [];
  const logs: SystemLogEntry[] = [];
  const cmp = getComparator(attribute, direction);

  let comparisons = 0;
  let swaps = 0;
  let shifts = 0;

  const algoNames: Record<SortAlgorithmType, string> = {
    radix: 'Radix Sort (LSD Non-Komparatif)',
    timsort: 'TimSort (Hybrid Insertion & Merge)',
    heapsort: 'Heap Sort (Binary Tree Max-Heap)',
    combsort: 'Comb Sort (Gap Shrink Factor 1.3)',
    quick: 'Quick Sort (Lomuto Partition & Pivot)',
    merge: 'Merge Sort (Divide & Conquer)',
    insertion: 'Insertion Sort (Pergeseran Sekuensial)',
    selection: 'Selection Sort (Pemindaian Nilai Ekstrem)',
    bubble: 'Bubble Sort (Penukaran Pasangan Bersebelahan)',
    shell: 'Shell Sort (Gapped Diminishing Increment)',
    cocktail: 'Cocktail Shaker Sort (Bidirectional Bubble)'
  };

  const algoName = algoNames[algorithm];
  const dirName = direction === 'asc' ? 'URUTAN NAIK (ASCENDING)' : 'URUTAN TURUN (DESCENDING)';
  const attrName = attribute === 'min_price' ? 'HARGA TIKET' : attribute === 'title' ? 'JUDUL ACARA' : attribute === 'event_code' ? 'KODE ACARA' : attribute === 'starts_at' ? 'TANGGAL ACARA' : 'KUOTA TIKET';

  logs.push({
    id: `log-${Date.now()}-0`,
    timestamp: makeTimestamp(),
    type: 'SORT',
    message: `Inisialisasi ${algoName} pada parameter [${attrName}] dengan mode [${dirName}]. Total data: ${arr.length} acara.`,
    variant: 'cyan'
  });

  // 1. RADIX SORT (Non-comparative distribution by digit places)
  if (algorithm === 'radix') {
    const rawValues = arr.map((item) => getNumericValue(item, attribute));
    const minVal = Math.min(...rawValues);
    const normalized = rawValues.map((v) => v - minVal);
    const maxVal = Math.max(...normalized, 0);

    let exp = 1;
    let pass = 1;

    logs.push({
      id: `log-radix-start-${Date.now()}`,
      timestamp: makeTimestamp(),
      type: 'RADIX',
      message: `Radix LSD aktif: normalisasi nilai minimum dasar rentang [0 sampai ${maxVal}]. Mempersiapkan 10 wadah ember (Bucket 0 sampai 9).`,
      variant: 'cyan'
    });

    while (Math.floor(maxVal / exp) > 0 || exp === 1) {
      const buckets: EventItem[][] = Array.from({ length: 10 }, () => []);
      const unitLabel = exp === 1 ? 'Satuan' : exp === 10 ? 'Puluhan' : exp === 100 ? 'Ratusan' : exp === 1000 ? 'Ribuan' : `Nilai Tempat ${exp}`;

      logs.push({
        id: `log-radix-pass-start-${pass}`,
        timestamp: makeTimestamp(),
        type: 'BUCKET',
        message: `Memulai Putaran ${pass} (Evaluasi Digit ${unitLabel}): Memeriksa nilai digit setiap elemen.`,
        variant: 'amber'
      });

      for (let i = 0; i < arr.length; i++) {
        const item = arr[i];
        const num = getNumericValue(item, attribute) - minVal;
        const digit = Math.floor((num / exp) % 10);
        buckets[digit].push(item);

        steps.push({
          type: 'radix',
          indices: [i],
          message: `Putaran ${pass} (${unitLabel}): ${item.event_code} (nilai: ${getAttrDisplayValue(item, attribute)}) memiliki digit [${digit}], dimasukkan ke Bucket ${digit}`,
          logType: 'BUCKET',
          snapshot: [...arr],
          stats: { comparisons, swaps, shifts }
        });
      }

      // Log distribution detail
      const bucketSummary = buckets
        .map((b, d) => b.length > 0 ? `Bucket ${d}: ${b.length} item` : null)
        .filter(Boolean)
        .join(', ');

      logs.push({
        id: `log-radix-pass-${pass}`,
        timestamp: makeTimestamp(),
        type: 'BUCKET',
        message: `Distribusi Putaran ${pass} selesai: ${bucketSummary}. Mengumpulkan kembali seluruh item ke array utama.`,
        variant: 'amber'
      });

      // Gather buckets back into array
      let idx = 0;
      if (direction === 'asc') {
        for (let b = 0; b < 10; b++) {
          for (const item of buckets[b]) {
            arr[idx++] = item;
            swaps++;
          }
        }
      } else {
        for (let b = 9; b >= 0; b--) {
          for (const item of buckets[b]) {
            arr[idx++] = item;
            swaps++;
          }
        }
      }

      steps.push({
        type: 'complete',
        indices: [0, arr.length - 1],
        message: `Kompilasi Putaran ${pass} (${unitLabel}) selesai dirangkai ke array utama`,
        logType: 'RADIX',
        snapshot: [...arr],
        stats: { comparisons, swaps, shifts }
      });

      exp *= 10;
      pass++;
      if (exp > maxVal && pass > 1) break;
    }

  // 2. TIM SORT (Hybrid Insertion & Merge)
  } else if (algorithm === 'timsort') {
    const RUN = 4;
    const n = arr.length;

    logs.push({
      id: `log-tim-init-${Date.now()}`,
      timestamp: makeTimestamp(),
      type: 'INFO',
      message: `TimSort membagi array ke dalam sub-array kecil (Run size = ${RUN}) untuk diurutkan dengan insertion sort, lalu digabungkan secara galloping merge.`
    });

    for (let i = 0; i < n; i += RUN) {
      const right = Math.min(i + RUN - 1, n - 1);
      logs.push({
        id: `log-tim-run-${i}`,
        timestamp: makeTimestamp(),
        type: 'SORT',
        message: `Menjalankan Insertion Sort pada blok Run lokal indeks rentang [${i} sampai ${right}].`
      });

      for (let j = i + 1; j <= right; j++) {
        const temp = arr[j];
        let k = j - 1;
        while (k >= i) {
          comparisons++;
          if (cmp(arr[k], temp) > 0) {
            arr[k + 1] = arr[k];
            shifts++;
            k--;
          } else {
            break;
          }
        }
        arr[k + 1] = temp;
      }
    }

    for (let size = RUN; size < n; size = 2 * size) {
      for (let left = 0; left < n; left += 2 * size) {
        const mid = left + size - 1;
        const right = Math.min(left + 2 * size - 1, n - 1);
        if (mid < right) {
          logs.push({
            id: `log-tim-merge-${left}`,
            timestamp: makeTimestamp(),
            type: 'SORT',
            message: `Menggabungkan blok Run terurut: rentang [${left} sampai ${mid}] dengan rentang [${mid + 1} sampai ${right}].`
          });

          const len1 = mid - left + 1;
          const len2 = right - mid;
          const leftPart = arr.slice(left, mid + 1);
          const rightPart = arr.slice(mid + 1, right + 1);

          let i = 0, j = 0, k = left;
          while (i < len1 && j < len2) {
            comparisons++;
            if (cmp(leftPart[i], rightPart[j]) <= 0) {
              arr[k++] = leftPart[i++];
            } else {
              arr[k++] = rightPart[j++];
              swaps++;
            }
          }
          while (i < len1) arr[k++] = leftPart[i++];
          while (j < len2) arr[k++] = rightPart[j++];
        }
      }
    }

  // 3. HEAP SORT (Binary Max Heap)
  } else if (algorithm === 'heapsort') {
    const n = arr.length;

    function heapify(size: number, rootIdx: number) {
      let largest = rootIdx;
      const left = 2 * rootIdx + 1;
      const right = 2 * rootIdx + 2;

      if (left < size) {
        comparisons++;
        if (cmp(arr[left], arr[largest]) > 0) {
          largest = left;
        }
      }

      if (right < size) {
        comparisons++;
        if (cmp(arr[right], arr[largest]) > 0) {
          largest = right;
        }
      }

      if (largest !== rootIdx) {
        const swap = arr[rootIdx];
        arr[rootIdx] = arr[largest];
        arr[largest] = swap;
        swaps++;

        steps.push({
          type: 'swap',
          indices: [rootIdx, largest],
          message: `Penyesuaian Heapify sink: Tukar posisi elemen indeks ${rootIdx} dengan indeks ${largest}`,
          logType: 'HEAP',
          snapshot: [...arr],
          stats: { comparisons, swaps, shifts }
        });

        heapify(size, largest);
      }
    }

    logs.push({
      id: `log-heap-build-${Date.now()}`,
      timestamp: makeTimestamp(),
      type: 'HEAP',
      message: `Membangun struktur Binary Max-Heap dari ${n} node acara. Node akar (root) memegang nilai puncak.`,
      variant: 'cyan'
    });

    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      heapify(n, i);
    }

    logs.push({
      id: `log-heap-extract-${Date.now()}`,
      timestamp: makeTimestamp(),
      type: 'HEAP',
      message: `Pohon Heap selesai dibangun. Memulai ekstraksi elemen puncak ke posisi akhir secara bertahap.`,
      variant: 'amber'
    });

    for (let i = n - 1; i > 0; i--) {
      const temp = arr[0];
      arr[0] = arr[i];
      arr[i] = temp;
      swaps++;

      steps.push({
        type: 'swap',
        indices: [0, i],
        message: `Ekstraksi elemen puncak ${arr[i].event_code} ke posisi final indeks ${i}`,
        logType: 'HEAP',
        snapshot: [...arr],
        stats: { comparisons, swaps, shifts }
      });

      heapify(i, 0);
    }

  // 4. COMB SORT (Gap Shrink Factor 1.3)
  } else if (algorithm === 'combsort') {
    const n = arr.length;
    let gap = n;
    const shrink = 1.3;
    let sorted = false;

    logs.push({
      id: `log-comb-init-${Date.now()}`,
      timestamp: makeTimestamp(),
      type: 'INFO',
      message: `Comb Sort dimulai: jarak perbandingan awal gap = ${gap}, faktor pengecilan gap = 1.3.`
    });

    while (!sorted) {
      gap = Math.floor(gap / shrink);
      if (gap <= 1) {
        gap = 1;
        sorted = true;
      }

      logs.push({
        id: `log-comb-gap-${gap}`,
        timestamp: makeTimestamp(),
        type: 'SORT',
        message: `Memeriksa pasangan elemen dengan jarak lompatan gap = ${gap}.`
      });

      for (let i = 0; i + gap < n; i++) {
        comparisons++;
        if (cmp(arr[i], arr[i + gap]) > 0) {
          const temp = arr[i];
          arr[i] = arr[i + gap];
          arr[i + gap] = temp;
          swaps++;
          sorted = false;

          steps.push({
            type: 'swap',
            indices: [i, i + gap],
            message: `Tukar posisi elemen berjarak gap ${gap}: indeks ${i} dengan indeks ${i + gap}`,
            logType: 'SWAP',
            snapshot: [...arr],
            stats: { comparisons, swaps, shifts }
          });
        }
      }
    }

  // 5. QUICK SORT (Lomuto Partition & Pivot)
  } else if (algorithm === 'quick') {
    logs.push({
      id: `log-qs-start-${Date.now()}`,
      timestamp: makeTimestamp(),
      type: 'INFO',
      message: `Quick Sort dimulai: menggunakan algoritma partisi Lomuto dengan elemen terakhir sebagai pivot.`,
      variant: 'cyan'
    });

    function quickSortRecursive(low: number, high: number, depth: number) {
      if (low < high) {
        const pivotVal = arr[high];
        let i = low - 1;

        logs.push({
          id: `log-qs-part-${low}-${high}`,
          timestamp: makeTimestamp(),
          type: 'PIVOT',
          message: `Kedalaman rekursi ${depth}: Menentukan pivot pada indeks [${high}] (${pivotVal.event_code}, nilai: ${getAttrDisplayValue(pivotVal, attribute)}) untuk rentang indeks [${low} sampai ${high}].`,
          variant: 'amber'
        });

        for (let j = low; j < high; j++) {
          comparisons++;
          const isSmallerOrEqual = cmp(arr[j], pivotVal) <= 0;

          if (isSmallerOrEqual) {
            i++;
            if (i !== j) {
              const temp = arr[i];
              arr[i] = arr[j];
              arr[j] = temp;
              swaps++;

              steps.push({
                type: 'swap',
                indices: [i, j],
                pivotIndex: high,
                message: `Partisi: Elemen ${arr[i].event_code} pada indeks ${j} dipindahkan ke partisi kiri pada indeks ${i}`,
                logType: 'SWAP',
                snapshot: [...arr],
                stats: { comparisons, swaps, shifts }
              });
            }
          }
        }

        const pivotTarget = i + 1;
        if (pivotTarget !== high) {
          const temp = arr[pivotTarget];
          arr[pivotTarget] = arr[high];
          arr[high] = temp;
          swaps++;

          steps.push({
            type: 'swap',
            indices: [pivotTarget, high],
            pivotIndex: pivotTarget,
            message: `Menempatkan pivot ${pivotVal.event_code} ke posisi final partisi pada indeks ${pivotTarget}`,
            logType: 'PIVOT',
            snapshot: [...arr],
            stats: { comparisons, swaps, shifts }
          });
        }

        logs.push({
          id: `log-qs-pivot-locked-${pivotTarget}`,
          timestamp: makeTimestamp(),
          type: 'PIVOT',
          message: `Pivot ${pivotVal.event_code} terkunci pada posisi final indeks [${pivotTarget}]. Membagi rekursi ke sub-rentang kiri [${low} sampai ${pivotTarget - 1}] dan kanan [${pivotTarget + 1} sampai ${high}].`,
          variant: 'cyan'
        });

        quickSortRecursive(low, pivotTarget - 1, depth + 1);
        quickSortRecursive(pivotTarget + 1, high, depth + 1);
      }
    }

    quickSortRecursive(0, arr.length - 1, 1);

  // 6. MERGE SORT (Divide & Conquer)
  } else if (algorithm === 'merge') {
    logs.push({
      id: `log-ms-start-${Date.now()}`,
      timestamp: makeTimestamp(),
      type: 'INFO',
      message: `Merge Sort aktif: algoritma rekursif divide and conquer yang membagi array menjadi dua sub-array terurut lalu menggabungkannya kembali.`,
      variant: 'cyan'
    });

    function merge(start: number, mid: number, end: number) {
      const leftPart = arr.slice(start, mid + 1);
      const rightPart = arr.slice(mid + 1, end + 1);

      logs.push({
        id: `log-ms-merge-${start}-${end}`,
        timestamp: makeTimestamp(),
        type: 'SORT',
        message: `Menggabungkan dua sub-array: rentang kiri [${start} sampai ${mid}] (${leftPart.length} item) dengan rentang kanan [${mid + 1} sampai ${end}] (${rightPart.length} item).`
      });

      let i = 0, j = 0, k = start;

      while (i < leftPart.length && j < rightPart.length) {
        comparisons++;
        if (cmp(leftPart[i], rightPart[j]) <= 0) {
          arr[k] = leftPart[i++];
        } else {
          arr[k] = rightPart[j++];
          swaps++;
        }
        k++;
      }
      while (i < leftPart.length) arr[k++] = leftPart[i++];
      while (j < rightPart.length) arr[k++] = rightPart[j++];

      steps.push({
        type: 'merge',
        indices: [start, end],
        message: `Selesai menggabungkan sub-array rentang indeks [${start} sampai ${end}]`,
        logType: 'SORT',
        snapshot: [...arr],
        stats: { comparisons, swaps, shifts }
      });
    }

    function mergeSortRecursive(start: number, end: number) {
      if (start < end) {
        const mid = Math.floor((start + end) / 2);
        mergeSortRecursive(start, mid);
        mergeSortRecursive(mid + 1, end);
        merge(start, mid, end);
      }
    }

    mergeSortRecursive(0, arr.length - 1);

  // 7. INSERTION SORT (Contiguous Shifts)
  } else if (algorithm === 'insertion') {
    logs.push({
      id: `log-is-start-${Date.now()}`,
      timestamp: makeTimestamp(),
      type: 'INFO',
      message: `Insertion Sort aktif: memelihara sub-array terurut di sisi kiri dan menyisipkan elemen baru ke posisi yang sesuai melalui pergeseran elemen.`,
      variant: 'cyan'
    });

    for (let i = 1; i < arr.length; i++) {
      const key = arr[i];
      let j = i - 1;
      let shiftedCount = 0;

      logs.push({
        id: `log-is-key-${i}`,
        timestamp: makeTimestamp(),
        type: 'SORT',
        message: `Iterasi ${i}: Mengambil elemen kunci pada indeks [${i}] (${key.event_code}, nilai: ${getAttrDisplayValue(key, attribute)}).`
      });

      while (j >= 0) {
        comparisons++;
        if (cmp(arr[j], key) > 0) {
          arr[j + 1] = arr[j];
          shifts++;
          shiftedCount++;

          steps.push({
            type: 'shift',
            indices: [j, j + 1],
            message: `Pergeseran: Elemen indeks ${j} (${arr[j].event_code}) digeser ke indeks ${j + 1}`,
            logType: 'SHIFT',
            snapshot: [...arr],
            stats: { comparisons, swaps, shifts }
          });

          j--;
        } else {
          break;
        }
      }

      arr[j + 1] = key;

      logs.push({
        id: `log-is-placed-${i}`,
        timestamp: makeTimestamp(),
        type: 'SORT',
        message: `Elemen kunci ${key.event_code} disisipkan ke posisi indeks [${j + 1}] setelah ${shiftedCount} pergeseran.`
      });
    }

  // 8. SELECTION SORT (Min/Max Scanning)
  } else if (algorithm === 'selection') {
    logs.push({
      id: `log-ss-start-${Date.now()}`,
      timestamp: makeTimestamp(),
      type: 'INFO',
      message: `Selection Sort aktif: mencari elemen ${direction === 'asc' ? 'terkecil' : 'terbesar'} dari sisa array yang belum terurut dan menukarnya ke posisi awal setiap putaran.`,
      variant: 'cyan'
    });

    for (let i = 0; i < arr.length - 1; i++) {
      let targetIdx = i;

      logs.push({
        id: `log-ss-pass-${i}`,
        timestamp: makeTimestamp(),
        type: 'SORT',
        message: `Putaran ${i + 1}: Memindai elemen mulai dari indeks [${i}] sampai [${arr.length - 1}].`
      });

      for (let j = i + 1; j < arr.length; j++) {
        comparisons++;
        if (cmp(arr[j], arr[targetIdx]) < 0) {
          targetIdx = j;
          logs.push({
            id: `log-ss-candidate-${i}-${j}`,
            timestamp: makeTimestamp(),
            type: 'INFO',
            message: `Ditemukan kandidat baru yang lebih sesuai pada indeks [${j}] (${arr[j].event_code}, nilai: ${getAttrDisplayValue(arr[j], attribute)}).`
          });
        }
      }

      if (targetIdx !== i) {
        const temp = arr[i];
        arr[i] = arr[targetIdx];
        arr[targetIdx] = temp;
        swaps++;

        steps.push({
          type: 'swap',
          indices: [i, targetIdx],
          message: `Tukar posisi elemen indeks ${i} (${arr[targetIdx].event_code}) dengan elemen terpilih pada indeks ${targetIdx} (${arr[i].event_code})`,
          logType: 'SWAP',
          snapshot: [...arr],
          stats: { comparisons, swaps, shifts }
        });

        logs.push({
          id: `log-ss-swapped-${i}`,
          timestamp: makeTimestamp(),
          type: 'SWAP',
          message: `Putaran ${i + 1} selesai: Menempatkan elemen ${arr[i].event_code} ke posisi final indeks [${i}].`,
          variant: 'amber'
        });
      }
    }

  // 9. BUBBLE SORT (Adjacent Swaps)
  } else if (algorithm === 'bubble') {
    logs.push({
      id: `log-bs-start-${Date.now()}`,
      timestamp: makeTimestamp(),
      type: 'INFO',
      message: `Bubble Sort aktif: membandingkan pasangan elemen bersebelahan secara berulang dan menukarnya jika urutan tidak sesuai.`,
      variant: 'cyan'
    });

    for (let i = 0; i < arr.length - 1; i++) {
      let swappedInPass = false;

      logs.push({
        id: `log-bs-pass-${i}`,
        timestamp: makeTimestamp(),
        type: 'SORT',
        message: `Putaran ${i + 1}: Melakukan pemeriksaan gelembung dari indeks 0 sampai ${arr.length - i - 2}.`
      });

      for (let j = 0; j < arr.length - i - 1; j++) {
        comparisons++;
        if (cmp(arr[j], arr[j + 1]) > 0) {
          const temp = arr[j];
          arr[j] = arr[j + 1];
          arr[j + 1] = temp;
          swaps++;
          swappedInPass = true;

          steps.push({
            type: 'swap',
            indices: [j, j + 1],
            message: `Tukar posisi: indeks ${j} (${arr[j + 1].event_code}) dengan indeks ${j + 1} (${arr[j].event_code})`,
            logType: 'SWAP',
            snapshot: [...arr],
            stats: { comparisons, swaps, shifts }
          });
        }
      }

      if (!swappedInPass) {
        logs.push({
          id: `log-bs-early-${i}`,
          timestamp: makeTimestamp(),
          type: 'SUCCESS',
          message: `Putaran ${i + 1} selesai tanpa ada pertukaran sama sekali. Array telah terurut sempurna. Hentikan algoritma lebih awal.`,
          variant: 'green'
        });
        break;
      }
    }

  // 10. SHELL SORT (Gapped Diminishing Increment)
  } else if (algorithm === 'shell') {
    logs.push({
      id: `log-sh-start-${Date.now()}`,
      timestamp: makeTimestamp(),
      type: 'INFO',
      message: `Shell Sort aktif: penyortiran berbasis interval bertahap (diminishing increment).`,
      variant: 'cyan'
    });

    for (let gap = Math.floor(arr.length / 2); gap > 0; gap = Math.floor(gap / 2)) {
      logs.push({
        id: `log-sh-gap-${gap}`,
        timestamp: makeTimestamp(),
        type: 'SORT',
        message: `Menjalankan fase sub-array dengan interval gap = ${gap}.`
      });

      for (let i = gap; i < arr.length; i++) {
        const temp = arr[i];
        let j = i;
        while (j >= gap) {
          comparisons++;
          if (cmp(arr[j - gap], temp) > 0) {
            arr[j] = arr[j - gap];
            shifts++;
            j -= gap;
          } else break;
        }
        arr[j] = temp;
      }
    }

  // 11. COCKTAIL SHAKER SORT (Bidirectional Bubble)
  } else if (algorithm === 'cocktail') {
    let start = 0, end = arr.length - 1, swapped = true;
    let round = 1;

    logs.push({
      id: `log-cs-start-${Date.now()}`,
      timestamp: makeTimestamp(),
      type: 'INFO',
      message: `Cocktail Shaker Sort aktif: pengurutan gelembung dua arah secara bergantian (maju ke kanan, lalu mundur ke kiri).`,
      variant: 'cyan'
    });

    while (swapped) {
      swapped = false;

      logs.push({
        id: `log-cs-round-fwd-${round}`,
        timestamp: makeTimestamp(),
        type: 'SORT',
        message: `Siklus ${round} (Fase Maju): Memindai dari indeks ${start} ke indeks ${end}.`
      });

      for (let i = start; i < end; i++) {
        comparisons++;
        if (cmp(arr[i], arr[i + 1]) > 0) {
          const temp = arr[i];
          arr[i] = arr[i + 1];
          arr[i + 1] = temp;
          swaps++;
          swapped = true;
        }
      }

      if (!swapped) break;
      swapped = false;
      end--;

      logs.push({
        id: `log-cs-round-bwd-${round}`,
        timestamp: makeTimestamp(),
        type: 'SORT',
        message: `Siklus ${round} (Fase Mundur): Memindai dari indeks ${end} ke indeks ${start}.`
      });

      for (let i = end - 1; i >= start; i--) {
        comparisons++;
        if (cmp(arr[i], arr[i + 1]) > 0) {
          const temp = arr[i];
          arr[i] = arr[i + 1];
          arr[i + 1] = temp;
          swaps++;
          swapped = true;
        }
      }
      start++;
      round++;
    }
  }

  const executionTimeMs = Number((performance.now() - startTime).toFixed(2));

  steps.push({
    type: 'complete',
    indices: [],
    message: 'Seluruh tahapan penyortiran selesai dieksekusi secara presisi.',
    logType: 'SUCCESS',
    snapshot: [...arr],
    stats: { comparisons, swaps, shifts }
  });

  logs.push({
    id: `log-done-${Date.now()}`,
    timestamp: makeTimestamp(),
    type: 'SUCCESS',
    message: `Eksekusi ${algoName} selesai secara tuntas. Seluruh ${arr.length} acara telah terurut sesuai [${dirName}].`,
    variant: 'green'
  });

  logs.push({
    id: `log-stats-${Date.now()}`,
    timestamp: makeTimestamp(),
    type: 'STATS',
    message: `Laporan Telemetri: Perbandingan: ${comparisons} kali | Pertukaran (Swap): ${swaps} kali${shifts > 0 ? ` | Pergeseran (Shift): ${shifts} kali` : ''} | Waktu Eksekusi: ${executionTimeMs} ms.`,
    variant: 'green'
  });

  return {
    sortedArray: arr,
    steps,
    logs,
    totalComparisons: comparisons,
    totalSwaps: swaps,
    totalShifts: shifts,
    executionTimeMs
  };
}
