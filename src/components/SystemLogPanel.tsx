// Menu: Panel Log PRTS

import React, { useEffect, useRef, useState } from 'react';
import { SystemLogEntry } from '../types/algorithms';
import { Terminal } from 'lucide-react';

interface SystemLogPanelProps {
  logs: SystemLogEntry[];
  activeAction: 'sorting' | 'searching' | 'idle';
  summaryStats?: {
    comparisons?: number;
    swaps?: number;
    shifts?: number;
    elementsChecked?: number;
    executionTimeMs?: number;
    algoName?: string;
  };
  onClearLogs?: () => void;
}

export const SystemLogPanel: React.FC<SystemLogPanelProps> = ({
  logs,
  activeAction,
  summaryStats,
  onClearLogs
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Auto-scroll to latest log entries
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const getTagColor = (type: string, variant?: string) => {
    if (variant === 'green' || type === 'SUCCESS' || type === 'MATCH') {
      return 'text-green-ink bg-[#2BB673]/10 border-[#2BB673]/30';
    }
    if (variant === 'red' || type === 'NOT_FOUND' || type === 'ERROR') {
      return 'text-[#D93636] bg-[#D93636]/10 border-[#D93636]/30';
    }
    if (variant === 'cyan' || type === 'HASH' || type === 'TRIE' || type === 'FIBONACCI' || type === 'RADIX' || type === 'HEAP') {
      return 'text-coral-ink bg-[#F2542D]/10 border-[#F2542D]/30';
    }
    if (variant === 'amber' || type === 'SORT' || type === 'SEARCH' || type === 'SWAP' || type === 'BUCKET' || type === 'PIVOT') {
      return 'text-amber-ink bg-[#FFB81C]/10 border-[#FFB81C]/30';
    }
    return 'text-ink2 bg-card border-line';
  };

  return (
    <div className="w-full bg-card border border-line rounded-xl overflow-hidden shadow-lg my-4">
      {/* Terminal Title Bar */}
      <div className="bg-head px-4 py-2.5 border-b border-line flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-6 h-6 rounded-lg bg-paper border border-line flex items-center justify-center text-coral-ink">
            <Terminal className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-sans text-xs font-bold text-ink">
                PRTS SYSTEM LOG // OPERATIONAL ENGINE
              </span>
              <span className="text-[11px] font-sans text-coral-ink font-semibold">
                ({logs.length} Baris Log)
              </span>
              <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[10px] font-sans bg-paper border border-line">
                <span className={`w-1.5 h-1.5 rounded-full ${activeAction === 'idle' ? 'bg-[#2BB673]' : 'bg-[#F2542D] animate-pulse'}`} />
                <span className="text-ink2 font-bold">
                  {activeAction === 'idle' ? 'STANDBY' : activeAction}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center space-x-2 text-xs font-sans text-ink2">
          {summaryStats && summaryStats.algoName && (
            <span className="hidden sm:inline-flex items-center text-coral-ink bg-paper px-2.5 py-1 rounded-lg border border-line font-semibold text-[11px]">
              {summaryStats.algoName}
            </span>
          )}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`px-2.5 py-1 rounded-lg transition-colors text-[11px] font-semibold border ${
              autoScroll 
                ? 'text-coral-ink bg-[#F2542D]/10 border-[#F2542D]/30' 
                : 'text-ink2 hover:text-ink bg-paper border-line'
            }`}
            title="Aktifkan atau nonaktifkan scroll otomatis"
          >
            {autoScroll ? 'Auto-Scroll: ON' : 'Auto-Scroll: OFF'}
          </button>
          {onClearLogs && (
            <button
              onClick={onClearLogs}
              className="px-2.5 py-1 rounded-lg text-[11px] text-ink2 hover:text-ink bg-paper border border-line hover:border-[#D93636]/40 transition-colors"
              title="Bersihkan riwayat log"
            >
              Bersihkan Log
            </button>
          )}
        </div>
      </div>

      {/* Metrics Strip */}
      {summaryStats && (
        <div className="bg-paper px-4 py-2 border-b border-line/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-sans text-ink2">
          {summaryStats.comparisons !== undefined && (
            <div>
              <span className="text-muted">Perbandingan: </span>
              <span className="text-ink font-semibold">{summaryStats.comparisons}</span>
            </div>
          )}
          {summaryStats.swaps !== undefined && (
            <div>
              <span className="text-muted">Tukar / Geser: </span>
              <span className="text-amber-ink font-semibold">
                {summaryStats.swaps} {summaryStats.shifts ? `(geser ${summaryStats.shifts})` : ''}
              </span>
            </div>
          )}
          {summaryStats.elementsChecked !== undefined && (
            <div>
              <span className="text-muted">Elemen Diperiksa: </span>
              <span className="text-green-ink font-semibold">{summaryStats.elementsChecked}</span>
            </div>
          )}
          {summaryStats.executionTimeMs !== undefined && (
            <div>
              <span className="text-muted">Durasi: </span>
              <span className="text-coral-ink font-semibold">{summaryStats.executionTimeMs} ms</span>
            </div>
          )}
        </div>
      )}

      {/* Log Streams Window */}
      <div 
        ref={scrollRef}
        className="h-56 sm:h-64 overflow-y-auto p-3.5 font-sans text-xs leading-relaxed space-y-1.5 bg-paper"
      >
        {logs.length === 0 ? (
          <div className="text-muted py-8 text-center text-xs">
            [PRTS READY] Awaiting algorithm parameter selection. Operational telemetry steps will stream here in real-time.
          </div>
        ) : (
          logs.map((entry) => (
            <div 
              key={entry.id} 
              className="flex items-start space-x-2.5 font-sans text-xs"
            >
              <span className="text-muted text-[10px] select-none pt-0.5 w-18 shrink-0">
                {entry.timestamp}
              </span>

              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold  border  shrink-0 ${getTagColor(entry.type, entry.variant)}`}>
                [{entry.type}]
              </span>

              <span className={`break-all ${
                entry.variant === 'green'
                  ? 'text-green-ink font-medium'
                  : entry.variant === 'red'
                  ? 'text-[#D93636] font-medium'
                  : entry.variant === 'cyan'
                  ? 'text-coral-ink'
                  : entry.variant === 'amber'
                  ? 'text-amber-ink'
                  : 'text-ink'
              }`}>
                {entry.message}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};