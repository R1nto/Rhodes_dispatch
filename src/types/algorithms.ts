/**
 * Rhodes Dispatch - Algorithm Types & Step Definitions
 * Includes high-speed sorting (Radix, TimSort, HeapSort, CombSort)
 * and ultra-fast searching (Hash-Indexed O(1), Trie Prefix, Fibonacci)
 */

import { EventItem } from './database';

export type SortAlgorithmType = 
  | 'radix'
  | 'timsort'
  | 'heapsort'
  | 'quick' 
  | 'merge' 
  | 'combsort'
  | 'insertion' 
  | 'selection' 
  | 'bubble' 
  | 'shell' 
  | 'cocktail';

export type SortAttribute = 'min_price' | 'title' | 'event_code' | 'starts_at' | 'available_stock';
export type SortDirection = 'asc' | 'desc';

export type SearchAlgorithmType = 
  | 'hash'
  | 'trie'
  | 'fibonacci'
  | 'binary'
  | 'jump'
  | 'exponential'
  | 'interpolation'
  | 'linear';

export type SearchAttribute = 'event_code' | 'title';

export type LogType = 
  | 'SORT' 
  | 'SEARCH' 
  | 'COMPARE' 
  | 'SWAP' 
  | 'SHIFT' 
  | 'PIVOT' 
  | 'RADIX'
  | 'BUCKET'
  | 'HEAP'
  | 'HASH'
  | 'TRIE'
  | 'FIBONACCI'
  | 'MERGE'
  | 'JUMP'
  | 'PARTITION'
  | 'CHECK' 
  | 'MATCH' 
  | 'MISS' 
  | 'SUCCESS' 
  | 'NOT_FOUND' 
  | 'STATS' 
  | 'INFO';

export interface SystemLogEntry {
  id: string;
  timestamp: string;
  type: LogType;
  message: string;
  highlightIndices?: number[];
  variant?: 'amber' | 'cyan' | 'green' | 'red' | 'default';
}

export interface SortStep {
  type: 'compare' | 'swap' | 'shift' | 'pivot' | 'partition' | 'merge' | 'radix' | 'complete';
  indices: number[];
  pivotIndex?: number;
  message: string;
  logType: LogType;
  snapshot: EventItem[];
  stats: {
    comparisons: number;
    swaps: number;
    shifts?: number;
  };
}

export interface SortResult {
  sortedArray: EventItem[];
  steps: SortStep[];
  logs: SystemLogEntry[];
  totalComparisons: number;
  totalSwaps: number;
  totalShifts: number;
  executionTimeMs: number;
}

export interface SearchStep {
  type: 'check' | 'compare' | 'jump' | 'hash' | 'trie' | 'match' | 'miss' | 'boundary' | 'complete';
  currentIndex?: number;
  leftIndex?: number;
  rightIndex?: number;
  midIndex?: number;
  jumpFrom?: number;
  jumpTo?: number;
  target: string;
  message: string;
  logType: LogType;
  foundIndex?: number;
  stats: {
    elementsChecked: number;
  };
}

export interface SearchResult {
  foundIndex: number | null;
  matchedItem: EventItem | null;
  steps: SearchStep[];
  logs: SystemLogEntry[];
  totalChecked: number;
  executionTimeMs: number;
  requiredPreSort?: boolean;
}
