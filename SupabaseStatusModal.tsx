// Menu: Status Database & Server

import React, { useState } from 'react';
import { isSupabaseConfigured, resetDemoRegistry } from '../lib/supabase';
import { X, Database, CheckCircle2, AlertTriangle, RefreshCw, Key, ShieldCheck, Copy, Check } from 'lucide-react';

interface SupabaseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataReset: () => void;
}

export const SupabaseStatusModal: React.FC<SupabaseStatusModalProps> = ({
  isOpen,
  onClose,
  onDataReset
}) => {
  const [copied, setCopied] = useState(false);
  const [resetting, setResetting] = useState(false);

  if (!isOpen) return null;

  const envSnippet = `# Add these to your .env or AI Studio Secrets:
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-publishable-key"`;

  const handleCopy = () => {
    navigator.clipboard.writeText(envSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setResetting(true);
    resetDemoRegistry();
    setTimeout(() => {
      setResetting(false);
      onDataReset();
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-[#171B22] border border-[#303640] rounded max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#13171E] px-4 py-3 border-b border-[#303640] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-[#E6AD39]" />
            <span className="font-mono text-xs font-semibold text-[#E8E9EC] uppercase tracking-wider">
              DATABASE ARCHITECTURE STATUS
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded text-[#969EAA] hover:text-[#E8E9EC] hover:bg-[#303640]/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-5 space-y-4 text-xs">
          
          {/* Active Mode Notice */}
          <div className={`p-3.5 rounded border ${
            isSupabaseConfigured
              ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
              : 'bg-[#13171E] border-[#E6AD39]/40 text-[#E8E9EC]'
          }`}>
            <div className="flex items-center space-x-2 font-mono font-bold text-xs uppercase mb-1">
              {isSupabaseConfigured ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>SUPABASE POSTGRESQL CONNECTED</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-[#E6AD39]" />
                  <span>DEMO MODE ACTIVE (LOCAL STORAGE PERSISTENCE)</span>
                </>
              )}
            </div>
            <p className="text-[11px] text-[#969EAA] leading-relaxed">
              {isSupabaseConfigured
                ? 'Queries and bookings are transmitted directly to your Supabase PostgreSQL instance with Row Level Security (RLS) enforcement.'
                : 'Supabase URL/Anon Key environment variables are currently unconfigured. The application is operating in full standalone DEMO MODE with simulated atomic storage in your browser session. Quotas and booking tickets will be generated and deducted realistically.'}
            </p>
          </div>

          {/* Database Schema Reference */}
          <div className="space-y-1.5">
            <h4 className="font-mono text-xs text-[#E8E9EC] font-semibold uppercase">
              SQL Schema & Migration
            </h4>
            <p className="text-[11px] text-[#969EAA]">
              A complete production SQL migration file is included at <code className="text-[#E6AD39] font-mono">/supabase/schema.sql</code>. It includes:
            </p>
            <ul className="list-disc list-inside space-y-0.5 text-[11px] text-[#969EAA] font-mono pl-1">
              <li>profiles, events, ticket_types, bookings, booking_items, tickets</li>
              <li>Row Level Security (RLS) policies</li>
              <li>Stored atomic function <code className="text-emerald-400">book_tickets_atomic</code> (race-condition protection)</li>
            </ul>
          </div>

          {/* Configuration Guide */}
          {!isSupabaseConfigured && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] text-[#969EAA] uppercase">
                  Environment Configuration
                </span>
                <button
                  onClick={handleCopy}
                  className="flex items-center space-x-1 text-[10px] font-mono text-[#E6AD39] hover:underline"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy Env'}</span>
                </button>
              </div>

              <pre className="p-2.5 rounded bg-[#0D1015] border border-[#303640] font-mono text-[11px] text-[#969EAA] overflow-x-auto">
                {envSnippet}
              </pre>
            </div>
          )}

          {/* Demo Reset Action */}
          <div className="pt-2 border-t border-[#303640] flex items-center justify-between">
            <div>
              <span className="font-mono text-xs text-[#E8E9EC] block">Reset Demo Registry</span>
              <span className="text-[10px] text-[#626A76]">Restores original quotas and sample bookings</span>
            </div>
            <button
              onClick={handleReset}
              disabled={resetting}
              className="px-3 py-1.5 rounded bg-[#13171E] border border-[#303640] hover:border-rose-500/50 hover:text-rose-400 text-xs font-mono transition-colors flex items-center space-x-1"
            >
              <RefreshCw className={`w-3 h-3 ${resetting ? 'animate-spin' : ''}`} />
              <span>RESET DATA</span>
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-[#13171E] px-4 py-2.5 border-t border-[#303640] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded text-xs font-mono text-[#969EAA] hover:text-[#E8E9EC] hover:bg-[#303640]/40"
          >
            DISMISS
          </button>
        </div>

      </div>
    </div>
  );
};
