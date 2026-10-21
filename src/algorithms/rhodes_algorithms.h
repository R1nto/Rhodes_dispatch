/**
 * RHODES DISPATCH — TACTICAL ALGORITHM MODULE
 * Header file for Array, Pointer, and Struct demonstration.
 * Language: C99 / C++ compatible
 */

#ifndef RHODES_ALGORITHMS_H
#define RHODES_ALGORITHMS_H

#include <stddef.h>

#ifdef __cplusplus
extern "C" {
#endif

/**
 * EventTicket Struct:
 * Models an operational event ticket in contiguous memory.
 */
typedef struct {
    int id;
    char event_code[16];
    char title[64];
    char category[32];
    long long starts_at_timestamp;
    double min_price;
    int available_stock;
} EventTicket;

/**
 * Metric tracking structure for algorithm audits.
 */
typedef struct {
    long long comparisons;
    long long swaps;
    long long shifts;
    long long elements_checked;
} AlgorithmMetrics;

/**
 * Sorting comparator signature using real C pointers.
 */
typedef int (*EventComparator)(const EventTicket* a, const EventTicket* b, int ascending);

/* Comparators for Struct fields */
int compare_by_price(const EventTicket* a, const EventTicket* b, int ascending);
int compare_by_code(const EventTicket* a, const EventTicket* b, int ascending);
int compare_by_title(const EventTicket* a, const EventTicket* b, int ascending);
int compare_by_stock(const EventTicket* a, const EventTicket* b, int ascending);
int compare_by_date(const EventTicket* a, const EventTicket* b, int ascending);

/* Swap function using pointer dereferencing */
void swap_event_tickets(EventTicket* a, EventTicket* b, AlgorithmMetrics* metrics);

/* Sorting Algorithms Operating on Array of Structs */
void bubble_sort_events(EventTicket* array, size_t length, EventComparator cmp, int ascending, AlgorithmMetrics* metrics);
void selection_sort_events(EventTicket* array, size_t length, EventComparator cmp, int ascending, AlgorithmMetrics* metrics);
void insertion_sort_events(EventTicket* array, size_t length, EventComparator cmp, int ascending, AlgorithmMetrics* metrics);
void quick_sort_events(EventTicket* array, int low, int high, EventComparator cmp, int ascending, AlgorithmMetrics* metrics);

/* Searching Algorithms */
int linear_search_by_code(const EventTicket* array, size_t length, const char* target_code, AlgorithmMetrics* metrics);
int binary_search_by_code(const EventTicket* array, size_t length, const char* target_code, AlgorithmMetrics* metrics);

#ifdef __cplusplus
}
#endif

#endif /* RHODES_ALGORITHMS_H */
