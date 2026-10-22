// Menu: Jelajahi Acara & Operasi Algoritma

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { EventItem } from '../types/database';
import { 
  SortAlgorithmType, 
  SortAttribute, 
  SortDirection, 
  SearchAlgorithmType, 
  SearchAttribute, 
  SystemLogEntry 
} from '../types/algorithms';
import { executeSorting } from '../algorithms/sorting';
import { executeSearch } from '../algorithms/searching';
import { SystemLogPanel } from '../components/SystemLogPanel';
import { EventCard } from '../components/EventCard';
import { Search, RotateCcw } from 'lucide-react';

interface OperationsPageProps {
  events: EventItem[];
  onViewEventDetails: (event: EventItem) => void;
}

export const OperationsPage: React.FC<OperationsPageProps> = ({
  events: initialEvents,
  onViewEventDetails
}) => {
  // Category Filter
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Sorting State (Defaults to Radix Sort for lightning speed!)
  const [sortAlgorithm, setSortAlgorithm] = useState<SortAlgorithmType>('radix');
  const [sortAttribute, setSortAttribute] = useState<SortAttribute>('min_price');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Searching State (Defaults to Hash-Indexed for instant O(1) discovery!)
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>('');
  const [searchAlgorithm, setSearchAlgorithm] = useState<SearchAlgorithmType>('hash');
  const [searchAttribute, setSearchAttribute] = useState<SearchAttribute>('event_code');

  // Visual Highlighting State
  const [displayedEvents, setDisplayedEvents] = useState<EventItem[]>(initialEvents);
  const [systemLogs, setSystemLogs] = useState<SystemLogEntry[]>([]);
  const [activeAction, setActiveAction] = useState<'sorting' | 'searching' | 'idle'>('idle');

  const [highlightIndices, setHighlightIndices] = useState<number[]>([]);
  const [swapIndices, setSwapIndices] = useState<number[]>([]);
  const [pivotIndex, setPivotIndex] = useState<number | undefined>(undefined);
  const [matchedIndex, setMatchedIndex] = useState<number | null>(null);

  const [summaryStats, setSummaryStats] = useState<{
    comparisons?: number;
    swaps?: number;
    shifts?: number;
    elementsChecked?: number;
    executionTimeMs?: number;
    algoName?: string;
  }>({});

  const categories = ['ALL', 'Anime Con', 'Esports', 'Music & Symphony', 'Cosplay', 'Gaming'];

  // Filter events by selected category
  const filteredBaseEvents = useMemo(() => {
    if (selectedCategory === 'ALL') return initialEvents;
    return initialEvents.filter((e) => e.category === selectedCategory);
  }, [initialEvents, selectedCategory]);

  // Debounce search input (220ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 220);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  const animationTimerRef = useRef<number[]>([]);

  const clearAnimationTimers = () => {
    animationTimerRef.current.forEach((id) => window.clearTimeout(id));
    animationTimerRef.current = [];
  };

  useEffect(() => {
    return () => clearAnimationTimers();
  }, []);

  // AUTOMATIC RE-EXECUTION ENGINE:
  useEffect(() => {
    clearAnimationTimers();

    const isSearching = Boolean(debouncedSearchQuery.trim());

    if (!isSearching) {
      setActiveAction('sorting');
      setMatchedIndex(null);

      const sortRes = executeSorting(
        filteredBaseEvents,
        sortAlgorithm,
        sortAttribute,
        sortDirection
      );

      setSystemLogs(sortRes.logs);
      setSummaryStats({
        comparisons: sortRes.totalComparisons,
        swaps: sortRes.totalSwaps,
        shifts: sortRes.totalShifts,
        executionTimeMs: sortRes.executionTimeMs,
        algoName: `${sortAlgorithm.toUpperCase()} SORT [${sortAttribute.toUpperCase()}]`
      });

      if (sortRes.steps.length > 0) {
        const sampleSteps = sortRes.steps.slice(0, 5);
        sampleSteps.forEach((step, idx) => {
          const timerId = window.setTimeout(() => {
            if (step.type === 'compare' || step.type === 'radix') {
              setHighlightIndices(step.indices);
              setSwapIndices([]);
            } else if (step.type === 'swap' || step.type === 'shift' || step.type === 'merge') {
              setSwapIndices(step.indices);
              setHighlightIndices([]);
            }
            if (step.pivotIndex !== undefined) {
              setPivotIndex(step.pivotIndex);
            }
          }, idx * 70);
          animationTimerRef.current.push(timerId);
        });

        const finalTimerId = window.setTimeout(() => {
          setDisplayedEvents(sortRes.sortedArray);
          setHighlightIndices([]);
          setSwapIndices([]);
          setPivotIndex(undefined);
          setActiveAction('idle');
        }, sampleSteps.length * 70 + 30);
        animationTimerRef.current.push(finalTimerId);
      } else {
        setDisplayedEvents(sortRes.sortedArray);
        setActiveAction('idle');
      }

    } else {
      setActiveAction('searching');

      const baseSorted = executeSorting(
        filteredBaseEvents,
        sortAlgorithm,
        sortAttribute,
        sortDirection
      ).sortedArray;

      const searchRes = executeSearch(
        baseSorted,
        debouncedSearchQuery,
        searchAlgorithm,
        searchAttribute
      );

      setSystemLogs(searchRes.logs);
      setSummaryStats({
        elementsChecked: searchRes.totalChecked,
        executionTimeMs: searchRes.executionTimeMs,
        algoName: `${searchAlgorithm.toUpperCase()} SEARCH [${searchAttribute.toUpperCase()}]`
      });

      // Hanya tampilkan acara yang cocok dengan kata kunci (kode, judul, atau kategori)
      const keyword = debouncedSearchQuery.trim().toLowerCase();
      const matches = baseSorted.filter(
        (e) =>
          e.event_code.toLowerCase().includes(keyword) ||
          e.title.toLowerCase().includes(keyword) ||
          e.category.toLowerCase().includes(keyword)
      );

      // Hasil dari algoritma pencarian ikut dimasukkan jika belum ada
      const algoHit = searchRes.foundIndex !== null ? baseSorted[searchRes.foundIndex] : null;
      const resultList =
        algoHit && !matches.some((e) => e.id === algoHit.id)
          ? baseSorted.filter((e) => e.id === algoHit.id || matches.some((m) => m.id === e.id))
          : matches;

      setHighlightIndices([]);
      setMatchedIndex(null);
      setDisplayedEvents(resultList);

      // Ringkasan hasil yang benar-benar ditampilkan di katalog
      setSystemLogs([
        ...searchRes.logs.filter((l) => l.variant !== 'red'),
        {
          id: `log-filter-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString('id-ID', { hour12: false }),
          type: 'SEARCH',
          message:
            resultList.length > 0
              ? `Katalog difilter: ${resultList.length} acara cocok dengan "${debouncedSearchQuery.trim()}" (kode, judul, atau kategori).`
              : `Tidak ada acara yang cocok dengan "${debouncedSearchQuery.trim()}".`,
          variant: resultList.length > 0 ? 'green' : 'red'
        }
      ]);

      const doneTimerId = window.setTimeout(() => {
        setActiveAction('idle');
      }, Math.min(searchRes.steps.length, 12) * 40 + 40);
      animationTimerRef.current.push(doneTimerId);
    }

  }, [
    filteredBaseEvents,
    sortAlgorithm,
    sortAttribute,
    sortDirection,
    debouncedSearchQuery,
    searchAlgorithm,
    searchAttribute
  ]);

  const handleClearSearch = () => {
    setSearchQuery('');
    setDebouncedSearchQuery('');
  };

  return (
    <div className="space-y-6 py-6 sm:py-8">
      
      {/* Box Office Catalog Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-line">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-ink">
            Katalog Acara &amp; Tiket Resmi
          </h1>
          <p className="text-xs text-ink2 mt-1 font-normal">
            Pilih tiket acara impian Anda &bull; Sistem pemrosesan kuota dan pencarian otomatis berkecepatan tinggi
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="px-3.5 py-1.5 rounded-xl bg-card border border-line text-ink2">
            Tiket Aktif: <strong className="text-ink font-bold">{displayedEvents.length} Acara</strong>
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-green-tint border border-emerald-500/30 text-green-ink font-semibold">
            Penjualan Buka
          </span>
        </div>
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-primary text-on-primary shadow-[0_4px_15px_rgba(68,161,164,0.25)]'
                : 'bg-card border border-line text-ink2 hover:text-ink hover:bg-soft'
            }`}
          >
            {cat === 'ALL' ? 'Semua Kategori' : cat}
          </button>
        ))}
      </div>

      {/* TACTICAL SEARCH & SORTING FILTER PANEL */}
      <section className="bg-card border border-line rounded-2xl p-4 sm:p-5 space-y-4 shadow-lg">
        
        {/* Row 1: Search Controls */}
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search Input Bar */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink2">
              <Search className="w-4 h-4 text-accent-ink" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari konser, anime expo, atau kode tiket (contoh: RH-OP-01)..."
              className="w-full pl-10 pr-10 py-2.5 bg-paper border border-line focus:border-primary rounded-xl text-xs text-ink outline-none placeholder:text-muted transition-colors"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-ink2 hover:text-ink"
                title="Reset Pencarian"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Engine Mode & Target Field */}
          <div className="flex flex-wrap sm:flex-nowrap gap-2">
            <div className="flex items-center space-x-2 bg-paper border border-line px-3.5 py-2 rounded-xl">
              <span className="text-[11px] text-ink2 whitespace-nowrap">
                Engine Cari:
              </span>
              <select
                value={searchAlgorithm}
                onChange={(e) => setSearchAlgorithm(e.target.value as SearchAlgorithmType)}
                className="bg-transparent text-xs font-bold text-accent-ink outline-none cursor-pointer"
              >
                <option value="hash" className="bg-card text-ink">Hash Direct O(1) (Instan)</option>
                <option value="trie" className="bg-card text-ink">Trie Prefix Tree O(M)</option>
                <option value="fibonacci" className="bg-card text-ink">Fibonacci Search</option>
                <option value="binary" className="bg-card text-ink">Binary Search (Biner)</option>
                <option value="jump" className="bg-card text-ink">Jump Search (Blok √N)</option>
                <option value="exponential" className="bg-card text-ink">Exponential Search</option>
                <option value="interpolation" className="bg-card text-ink">Interpolation Search</option>
                <option value="linear" className="bg-card text-ink">Linear Search</option>
              </select>
            </div>

            <div className="flex items-center space-x-2 bg-paper border border-line px-3.5 py-2 rounded-xl">
              <span className="text-[11px] text-ink2 whitespace-nowrap">
                Kolom Target:
              </span>
              <select
                value={searchAttribute}
                onChange={(e) => setSearchAttribute(e.target.value as SearchAttribute)}
                className="bg-transparent text-xs font-bold text-accent-ink outline-none cursor-pointer"
              >
                <option value="event_code" className="bg-card text-ink">Kode Acara</option>
                <option value="title" className="bg-card text-ink">Judul Acara</option>
              </select>
            </div>
          </div>
        </div>

        {/* Row 2: Sorting Controls */}
        <div className="pt-3 border-t border-line/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          <div className="text-xs text-ink2">
            <span className="font-semibold text-ink">Penyortiran Tiket:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            
            {/* Sorting Algorithm Dropdown */}
            <div className="flex items-center space-x-1.5 bg-paper border border-line px-3 py-1.5 rounded-xl">
              <span className="text-[11px] text-ink2">Algoritma:</span>
              <select
                value={sortAlgorithm}
                onChange={(e) => setSortAlgorithm(e.target.value as SortAlgorithmType)}
                className="bg-transparent text-xs font-bold text-amber-ink outline-none cursor-pointer"
              >
                <option value="radix" className="bg-card text-ink">Radix Sort (LSD Bucket)</option>
                <option value="timsort" className="bg-card text-ink">TimSort (Galloping Hybrid)</option>
                <option value="heapsort" className="bg-card text-ink">Heap Sort (Binary Tree)</option>
                <option value="combsort" className="bg-card text-ink">Comb Sort (Shrink 1.3)</option>
                <option value="quick" className="bg-card text-ink">Quick Sort (Lomuto)</option>
                <option value="merge" className="bg-card text-ink">Merge Sort (Divide &amp; Conquer)</option>
                <option value="insertion" className="bg-card text-ink">Insertion Sort</option>
                <option value="selection" className="bg-card text-ink">Selection Sort</option>
                <option value="bubble" className="bg-card text-ink">Bubble Sort</option>
                <option value="shell" className="bg-card text-ink">Shell Sort (Gapped)</option>
                <option value="cocktail" className="bg-card text-ink">Cocktail Shaker Sort</option>
              </select>
            </div>

            {/* Sorting Attribute Dropdown */}
            <div className="flex items-center space-x-1.5 bg-paper border border-line px-3 py-1.5 rounded-xl">
              <span className="text-[11px] text-ink2">Parameter:</span>
              <select
                value={sortAttribute}
                onChange={(e) => setSortAttribute(e.target.value as SortAttribute)}
                className="bg-transparent text-xs font-bold text-amber-ink outline-none cursor-pointer"
              >
                <option value="min_price" className="bg-card text-ink">Harga Tiket</option>
                <option value="title" className="bg-card text-ink">Nama Acara (A-Z)</option>
                <option value="event_code" className="bg-card text-ink">Kode Acara</option>
                <option value="starts_at" className="bg-card text-ink">Tanggal Acara</option>
                <option value="available_stock" className="bg-card text-ink">Sisa Kuota Tiket</option>
              </select>
            </div>

            {/* Sort Direction Toggle */}
            <button
              onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-paper hover:bg-soft border border-line hover:border-[#FFB81C]/50 text-ink transition-colors"
              title="Ganti Arah Urutan"
            >
              <span>{sortDirection === 'asc' ? 'Urutkan Naik (Asc)' : 'Urutkan Turun (Desc)'}</span>
            </button>

          </div>

        </div>

      </section>

      {/* SINGLE INTEGRATED SYSTEM LOG PANEL */}
      <SystemLogPanel
        logs={systemLogs}
        activeAction={activeAction}
        summaryStats={summaryStats}
        onClearLogs={() => setSystemLogs([])}
      />

      {/* EVENT CARDS GRID */}
      <section className="space-y-4">
        <div className="flex items-center justify-between text-xs text-ink2 px-1">
          <span>
            Menampilkan <strong className="text-ink">{displayedEvents.length}</strong> acara siap pesan
          </span>
          {matchedIndex !== null && (
            <span className="text-green-ink font-semibold animate-pulse">
              ● Tiket Ditemukan: #{matchedIndex} ({displayedEvents[matchedIndex]?.event_code})
            </span>
          )}
        </div>

        {displayedEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {displayedEvents.map((event, index) => {
              const isComp = highlightIndices.includes(index);
              const isSwp = swapIndices.includes(index);
              const isPiv = pivotIndex === index;
              const isMatch = matchedIndex === index;

              return (
                <EventCard
                  key={event.id}
                  event={event}
                  index={index}
                  isCompared={isComp}
                  isSwapped={isSwp}
                  isPivot={isPiv}
                  isSearchChecked={highlightIndices.includes(index)}
                  isSearchMatch={isMatch}
                  onViewDetails={onViewEventDetails}
                />
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center rounded-2xl bg-card border border-line space-y-3 shadow-xl">
            <h3 className="text-sm font-bold text-ink">
              Tiket Acara Tidak Ditemukan
            </h3>
            <p className="text-xs text-ink2 max-w-sm mx-auto">
              Tidak ada acara yang cocok dengan pencarian "{debouncedSearchQuery}". Silakan coba kata kunci lain.
            </p>
            <button
              onClick={handleClearSearch}
              className="px-4 py-2 rounded-xl bg-paper border border-line hover:border-primary text-xs font-bold text-ink"
            >
              Reset Filter Pencarian
            </button>
          </div>
        )}
      </section>

    </div>
  );
};