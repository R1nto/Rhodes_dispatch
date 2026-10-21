/**
 * RHODES DISPATCH — TACTICAL ALGORITHM MODULE
 * Core Implementation: Array, Pointer, and Struct Operations.
 * 
 * Compilation Instructions:
 * 1. Native Shared Object (Linux/GCC):
 *    gcc -O2 -fPIC -shared -o librhodes_algo.so rhodes_algorithms.c
 * 
 * 2. WebAssembly via Emscripten:
 *    emcc rhodes_algorithms.c -O3 -s WASM=1 -s EXPORTED_FUNCTIONS="['_bubble_sort_events','_selection_sort_events','_insertion_sort_events','_quick_sort_events','_linear_search_by_code','_binary_search_by_code']" -o rhodes_algorithms.wasm
 */

#include "rhodes_algorithms.h"
#include <string.h>
#include <stdio.h>

/**
 * Swap two EventTicket structs using pointer manipulation and value assignment.
 */
void swap_event_tickets(EventTicket* a, EventTicket* b, AlgorithmMetrics* metrics) {
    if (a == b) return;
    EventTicket temp = *a;
    *a = *b;
    *b = temp;
    if (metrics) {
        metrics->swaps++;
    }
}

/**
 * Comparators for EventTicket Struct
 */
int compare_by_price(const EventTicket* a, const EventTicket* b, int ascending) {
    if (a->min_price == b->min_price) return 0;
    int res = (a->min_price < b->min_price) ? -1 : 1;
    return ascending ? res : -res;
}

int compare_by_code(const EventTicket* a, const EventTicket* b, int ascending) {
    int res = strcmp(a->event_code, b->event_code);
    return ascending ? res : -res;
}

int compare_by_title(const EventTicket* a, const EventTicket* b, int ascending) {
    int res = strcmp(a->title, b->title);
    return ascending ? res : -res;
}

int compare_by_stock(const EventTicket* a, const EventTicket* b, int ascending) {
    if (a->available_stock == b->available_stock) return 0;
    int res = (a->available_stock < b->available_stock) ? -1 : 1;
    return ascending ? res : -res;
}

int compare_by_date(const EventTicket* a, const EventTicket* b, int ascending) {
    if (a->starts_at_timestamp == b->starts_at_timestamp) return 0;
    int res = (a->starts_at_timestamp < b->starts_at_timestamp) ? -1 : 1;
    return ascending ? res : -res;
}

/**
 * 1. BUBBLE SORT
 * Iteratively compares adjacent struct elements and bubbles the extreme item to the tail.
 */
void bubble_sort_events(EventTicket* array, size_t length, EventComparator cmp, int ascending, AlgorithmMetrics* metrics) {
    if (!array || length < 2) return;

    for (size_t i = 0; i < length - 1; i++) {
        int swapped = 0;
        for (size_t j = 0; j < length - i - 1; j++) {
            if (metrics) metrics->comparisons++;

            // Compare adjacent struct elements using pointers
            if (cmp(&array[j], &array[j + 1], ascending) > 0) {
                swap_event_tickets(&array[j], &array[j + 1], metrics);
                swapped = 1;
            }
        }
        if (!swapped) break; // Optimization for already sorted segment
    }
}

/**
 * 2. SELECTION SORT
 * Finds the minimum (or maximum) element from the unsorted subarray and swaps it once per pass.
 */
void selection_sort_events(EventTicket* array, size_t length, EventComparator cmp, int ascending, AlgorithmMetrics* metrics) {
    if (!array || length < 2) return;

    for (size_t i = 0; i < length - 1; i++) {
        size_t target_idx = i;
        for (size_t j = i + 1; j < length; j++) {
            if (metrics) metrics->comparisons++;

            if (cmp(&array[j], &array[target_idx], ascending) < 0) {
                target_idx = j;
            }
        }

        if (target_idx != i) {
            swap_event_tickets(&array[i], &array[target_idx], metrics);
        }
    }
}

/**
 * 3. INSERTION SORT
 * Builds the sorted array one item at a time, shifting larger elements to the right.
 */
void insertion_sort_events(EventTicket* array, size_t length, EventComparator cmp, int ascending, AlgorithmMetrics* metrics) {
    if (!array || length < 2) return;

    for (size_t i = 1; i < length; i++) {
        EventTicket key = array[i]; // Store key struct
        long long j = (long long)i - 1;

        while (j >= 0) {
            if (metrics) metrics->comparisons++;

            if (cmp(&array[j], &key, ascending) > 0) {
                // Shift struct element right
                array[j + 1] = array[j];
                if (metrics) metrics->shifts++;
                j--;
            } else {
                break;
            }
        }
        array[j + 1] = key; // Insert struct key into target location
    }
}

/**
 * 4. QUICK SORT (Lomuto Partition Scheme)
 * Selects high as pivot and partitions smaller elements to the left.
 */
static int partition(EventTicket* array, int low, int high, EventComparator cmp, int ascending, AlgorithmMetrics* metrics) {
    EventTicket* pivot = &array[high];
    int i = low - 1;

    for (int j = low; j < high; j++) {
        if (metrics) metrics->comparisons++;

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
 * 5. LINEAR SEARCH
 * Sequentially inspects each struct by event_code.
 */
int linear_search_by_code(const EventTicket* array, size_t length, const char* target_code, AlgorithmMetrics* metrics) {
    if (!array || !target_code) return -1;

    for (size_t i = 0; i < length; i++) {
        if (metrics) metrics->elements_checked++;
        if (strcmp(array[i].event_code, target_code) == 0) {
            return (int)i; // Found matching struct index
        }
    }
    return -1; // NOT FOUND
}

/**
 * 6. BINARY SEARCH
 * Operates on array sorted by event_code ascending.
 */
int binary_search_by_code(const EventTicket* array, size_t length, const char* target_code, AlgorithmMetrics* metrics) {
    if (!array || !target_code || length == 0) return -1;

    int left = 0;
    int right = (int)length - 1;

    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (metrics) metrics->elements_checked++;

        int cmp_res = strcmp(array[mid].event_code, target_code);
        if (cmp_res == 0) {
            return mid; // Target struct found at mid index
        }

        if (cmp_res < 0) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    return -1; // NOT FOUND
}
