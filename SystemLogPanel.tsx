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
      return 'text-[#00E676] bg-[#00E676]/10 border-[#00E676]/30';
    }
    if (variant === 'red' || type === 'NOT_FOUND' || type === 'ERROR') {
      return 'text-[#FF5252] bg-[#FF5252]/10 border-[#FF5252]/30';
    }
    if (variant === 'cyan' || type === 'HASH' || type === 'TRIE' || type === 'FIBONACCI' || type === 'RADIX' || type === 'HEAP') {
      return 'text-[#00F0FF] bg-[#00F0FF]/10 border-[#00F0FF]/30';
    }
    if (variant === 'amber' || type === 'SORT' || type === 'SEARCH' || type === 'SWAP' || type === 'BUCKET' || type === 'PIVOT') {
      return 'text-[#FFB300] bg-[#FFB300]/10 border-[#FFB300]/30';
    }
    return 'text-[#90A0B7] bg-[#121721] border-[#263345]';
  };

  return (
    <div className="w-full bg-[#121721] border border-[#263345] rounded-xl overflow-hidden shadow-lg my-4">
      {/* Terminal Title Bar */}
      <div className="bg-[#0E131B] px-4 py-2.5 border-b border-[#263345] flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-6 h-6 rounded-lg bg-[#090D12] border border-[#263345] flex items-center justify-center text-[#00F0FF]">
            <Terminal className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-bold text-[#EEF2F6]">
                PRTS SYSTEM LOG // OPERATIONAL ENGINE
              </span>
              <span className="text-[11px] font-mono text-[#00F0FF] font-semibold">
                ({logs.length} Baris Log)
              </span>
              <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#090D12] border border-[#263345]">
                <span className={`w-1.5 h-1.5 rounded-full ${activeAction === 'idle' ? 'bg-[#00E676]' : 'bg-[#00F0FF] animate-pulse'}`} />
                <span className="text-[#90A0B7] uppercase font-bold">
                  {activeAction === 'idle' ? 'STANDBY' : activeAction}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center space-x-2 text-xs font-mono text-[#90A0B7]">
          {summaryStats && summaryStats.algoName && (
            <span className="hidden sm:inline-flex items-center text-[#00F0FF] bg-[#090D12] px-2.5 py-1 rounded-lg border border-[#263345] font-semibold text-[11px]">
              {summaryStats.algoName}
            </span>
          )}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`px-2.5 py-1 rounded-lg transition-colors text-[11px] font-semibold border ${
              autoScroll 
                ? 'text-[#00F0FF] bg-[#00F0FF]/10 border-[#00F0FF]/30' 
                : 'text-[#90A0B7] hover:text-[#EEF2F6] bg-[#090D12] border-[#263345]'
            }`}
            title="Aktifkan atau nonaktifkan scroll otomatis"
          >
            {autoScroll ? 'Auto-Scroll: ON' : 'Auto-Scroll: OFF'}
          </button>
          {onClearLogs && (
            <button
              onClick={onClearLogs}
              className="px-2.5 py-1 rounded-lg text-[11px] text-[#90A0B7] hover:text-[#EEF2F6] bg-[#090D12] border border-[#263345] hover:border-[#FF5252]/40 transition-colors"
              title="Bersihkan riwayat log"
            >
              Bersihkan Log
            </button>
          )}
        </div>
      </div>

      {/* Metrics Strip */}
      {summaryStats && (
        <div className="bg-[#090D12] px-4 py-2 border-b border-[#263345]/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono text-[#90A0B7]">
          {summaryStats.comparisons !== undefined && (
            <div>
              <span className="text-[#57687E]">Perbandingan: </span>
              <span className="text-[#EEF2F6] font-semibold">{summaryStats.comparisons}</span>
            </div>
          )}
          {summaryStats.swaps !== undefined && (
            <div>
              <span className="text-[#57687E]">Tukar / Geser: </span>
              <span className="text-[#FFB300] font-semibold">
                {summaryStats.swaps} {summaryStats.shifts ? `(geser ${summaryStats.shifts})` : ''}
              </span>
            </div>
          )}
          {summaryStats.elementsChecked !== undefined && (
            <div>
              <span className="text-[#57687E]">Elemen Diperiksa: </span>
              <span className="text-[#00E676] font-semibold">{summaryStats.elementsChecked}</span>
            </div>
          )}
          {summaryStats.executionTimeMs !== undefined && (
            <div>
              <span className="text-[#57687E]">Durasi: </span>
              <span className="text-[#00F0FF] font-semibold">{summaryStats.executionTimeMs} ms</span>
            </div>
          )}
        </div>
      )}

      {/* Log Streams Window */}
      <div 
        ref={scrollRef}
        className="h-56 sm:h-64 overflow-y-auto p-3.5 font-mono text-xs leading-relaxed space-y-1.5 bg-[#090D12]"
      >
        {logs.length === 0 ? (
          <div className="text-[#57687E] py-8 text-center text-xs">
            [PRTS READY] Awaiting algorithm parameter selection. Operational telemetry steps will stream here in real-time.
          </div>
        ) : (
          logs.map((entry) => (
            <div 
              key={entry.id} 
              className="flex items-start space-x-2.5 font-mono text-xs"
            >
              <span className="text-[#57687E] text-[10px] select-none pt-0.5 w-18 shrink-0">
                {entry.timestamp}
              </span>

              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide border uppercase shrink-0 ${getTagColor(entry.type, entry.variant)}`}>
                [{entry.type}]
              </span>

              <span className={`break-all ${
                entry.variant === 'green'
                  ? 'text-[#00E676] font-medium'
                  : entry.variant === 'red'
                  ? 'text-[#FF5252] font-medium'
                  : entry.variant === 'cyan'
                  ? 'text-[#00F0FF]'
                  : entry.variant === 'amber'
                  ? 'text-[#FFB300]'
                  : 'text-[#EEF2F6]'
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
