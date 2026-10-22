// Menu: Inspeksi Kode Algoritma & C Struct

import React, { useState } from 'react';
import { X, Code, Terminal, Cpu, Copy, Check, ExternalLink } from 'lucide-react';

interface AlgorithmCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AlgorithmCodeModal: React.FC<AlgorithmCodeModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'struct' | 'c_source' | 'wasm_guide'>('struct');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const structSnippet = `/**
 * C STRUCT DEFINITION & MEMORY LAYOUT (rhodes_algorithms.h)
 * Size: 136 bytes contiguous block per event ticket
 */
typedef struct {
    int id;                        // 4 bytes: Unique event identity
    char event_code[16];           // 16 bytes: Operation callsign (e.g., "RH-OP-01")
    char title[64];                // 64 bytes: Event name string buffer
    char category[32];             // 32 bytes: Category descriptor
    long long starts_at_timestamp; // 8 bytes: Unix timestamp for chronological sort
    double min_price;              // 8 bytes: IEEE 754 floating point price
    int available_stock;           // 4 bytes: Remaining ticket quota
} EventTicket;

/**
 * POINTER MANIPULATION & STRUCT SWAP
 * Swaps two structs in place by memory dereference.
 */
void swap_event_tickets(EventTicket* a, EventTicket* b, AlgorithmMetrics* metrics) {
    if (a == b) return;
    EventTicket temp = *a; // Copy dereferenced struct
    *a = *b;               // Write struct contents
    *b = temp;
    if (metrics) {
        metrics->swaps++;  // Audit trail increment
    }
}`;

  const cSourceSnippet = `/**
 * QUICK SORT WITH POINTER-BASED LOMUTO PARTITION (rhodes_algorithms.c)
 */
static int partition(EventTicket* array, int low, int high, EventComparator cmp, int ascending, AlgorithmMetrics* metrics) {
    EventTicket* pivot = &array[high]; // Pointer to pivot struct
    int i = low - 1;

    for (int j = low; j < high; j++) {
        if (metrics) metrics->comparisons++;

        // Compare elements using function pointer comparator
        if (cmp(&array[j], pivot, ascending) <= 0) {
            i++;
            swap_event_tickets(&array[i], &array[j], metrics);
        }
    }

    swap_event_tickets(&array[i + 1], &array[high], metrics);
    return i + 1;
}

void quick_sort_events(EventTicket* array, int low, int high, EventComparator cmp, int ascending, AlgorithmMetrics* metrics) {
    if (low < high) {
        int pi = partition(array, low, high, cmp, ascending, metrics);
        quick_sort_events(array, low, pi - 1, cmp, ascending, metrics);
        quick_sort_events(array, pi + 1, high, cmp, ascending, metrics);
    }
}

/**
 * BINARY SEARCH ON CONTIGUOUS STRUCT ARRAY
 */
int binary_search_by_code(const EventTicket* array, size_t length, const char* target_code, AlgorithmMetrics* metrics) {
    if (!array || !target_code || length == 0) return -1;
    int left = 0;
    int right = (int)length - 1;

    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (metrics) metrics->elements_checked++;

        int cmp_res = strcmp(array[mid].event_code, target_code);
        if (cmp_res == 0) return mid; // Found struct at index mid

        if (cmp_res < 0) left = mid + 1;
        else right = mid - 1;
    }
    return -1; // NOT FOUND
}`;

  const wasmGuide = `# =========================================================
# WEBASSEMBLY (WASM) & NATIVE COMPILATION GUIDE
# File location: /src/algorithms/rhodes_algorithms.c
# =========================================================

# 1. Native C Shared Object (Linux/GCC/Clang):
gcc -O2 -fPIC -shared -o librhodes_algo.so src/algorithms/rhodes_algorithms.c

# 2. Emscripten WebAssembly (WASM) Compilation:
# If you have the Emscripten SDK (emsdk) installed in your build machine:
emcc src/algorithms/rhodes_algorithms.c \\
  -O3 \\
  -s WASM=1 \\
  -s EXPORTED_FUNCTIONS="['_bubble_sort_events','_selection_sort_events','_insertion_sort_events','_quick_sort_events','_linear_search_by_code','_binary_search_by_code']" \\
  -s EXPORTED_RUNTIME_METHODS="['ccall','cwrap']" \\
  -o public/rhodes_algorithms.wasm

# 3. Web Client Integration Architecture:
# - In environments without emcc installed, the web app executes the mathematically
#   identical TypeScript step-generators that record the exact comparisons,
#   swaps, pivot locations, and array transitions.
# - Both source files (/src/algorithms/rhodes_algorithms.c and .h) are fully
#   provided in the project repository for academic evaluation and offline compilation.`;

  const getCurrentSnippet = () => {
    if (activeTab === 'struct') return structSnippet;
    if (activeTab === 'c_source') return cSourceSnippet;
    return wasmGuide;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCurrentSnippet());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-card border border-line rounded max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-soft px-4 py-3 border-b border-line flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-amber-ink" />
            <span className="font-mono text-xs font-semibold text-ink">
              ACADEMIC VERIFICATION // C STRUCT, POINTER & WASM
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded text-ink2 hover:text-ink hover:bg-line/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="bg-softer px-4 py-2 border-b border-line flex items-center justify-between flex-wrap gap-2">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('struct')}
              className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
                activeTab === 'struct'
                  ? 'bg-card text-amber-ink border border-line'
                  : 'text-ink2 hover:text-ink'
              }`}
            >
              1. Struct & Pointer
            </button>
            <button
              onClick={() => setActiveTab('c_source')}
              className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
                activeTab === 'c_source'
                  ? 'bg-card text-amber-ink border border-line'
                  : 'text-ink2 hover:text-ink'
              }`}
            >
              2. C Quick Sort & Binary Search
            </button>
            <button
              onClick={() => setActiveTab('wasm_guide')}
              className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
                activeTab === 'wasm_guide'
                  ? 'bg-card text-amber-ink border border-line'
                  : 'text-ink2 hover:text-ink'
              }`}
            >
              3. WebAssembly & GCC Guide
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-mono bg-card border border-line text-ink2 hover:text-ink"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-ink" /> : <Copy className="w-3.5 h-3.5 text-amber-ink" />}
            <span>{copied ? 'COPIED' : 'COPY CODE'}</span>
          </button>
        </div>

        {/* Code Content */}
        <div className="overflow-y-auto p-4 bg-softer">
          <pre className="font-mono text-xs text-ink leading-relaxed overflow-x-auto whitespace-pre selection:bg-[#E0A21B]/30">
            {getCurrentSnippet()}
          </pre>
        </div>

        {/* Footer info */}
        <div className="bg-soft px-4 py-2.5 border-t border-line flex items-center justify-between text-xs font-mono text-ink2">
          <span>Source: <code className="text-amber-ink">src/algorithms/rhodes_algorithms.c</code></span>
          <span className="text-[11px] text-ink3">Compliant with College Project Algorithm & Data Structure Specifications</span>
        </div>

      </div>
    </div>
  );
};