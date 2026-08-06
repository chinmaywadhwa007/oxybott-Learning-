import React from 'react';
import { Cpu, ChevronRight } from 'lucide-react';

interface BoardStatusCardProps {
  boardName: string;
  port: string;
  isConnected: boolean;
  chip?: string;
  vendor?: string;
  vendorId?: string;
  productId?: string;
  onOpenBoardInfo?: () => void;
}

export const BoardStatusCard: React.FC<BoardStatusCardProps> = ({
  boardName,
  port,
  isConnected = true,
  chip = 'ATmega328P',
  vendor = 'Arduino SA',
  vendorId,
  productId,
  onOpenBoardInfo,
}) => {
  return (
    <div className="w-full bg-transparent border-t border-[#1E293B]/60 p-2 select-none font-sans">
      <div className="bg-[#111A2E] border border-[#1E293B] rounded-xl p-2.5 space-y-2 shadow-sm">
        <div className="flex items-center gap-2.5">
          {/* Microcontroller graphic icon */}
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Cpu className="w-4 h-4" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-xs font-black text-white truncate">{boardName || 'Arduino Uno'}</div>
            <div className="text-[10px] font-mono text-slate-400 truncate">
              {port || 'COM3'} · <span className="text-[#38BDF8] font-bold">{chip}</span>
            </div>
            {vendor && (
              <div className="text-[9px] text-slate-500 truncate">
                {vendor} {vendorId && productId ? `(VID:${vendorId} PID:${productId})` : ''}
              </div>
            )}
            <div className="flex items-center gap-1.5 mt-0.5 text-[10px] font-bold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
          </div>
        </div>

        <button
          onClick={onOpenBoardInfo}
          className="w-full py-1 px-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] font-bold text-slate-300 hover:text-white flex items-center justify-center gap-1 transition-colors cursor-pointer"
        >
          <span>Board Info</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
