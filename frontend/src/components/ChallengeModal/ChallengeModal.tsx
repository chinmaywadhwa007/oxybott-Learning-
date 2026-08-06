import React, { useState } from 'react';
import { CHALLENGES, Challenge } from '../../education/challengesData';
import { X, Award, CheckCircle2, Circle, ArrowRight } from 'lucide-react';

interface ChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCode: string;
}

export const ChallengeModal: React.FC<ChallengeModalProps> = ({ isOpen, onClose, currentCode }) => {
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge>(CHALLENGES[0]);
  const [validationResult, setValidationResult] = useState<boolean | null>(null);

  if (!isOpen) return null;

  const handleValidate = () => {
    const passed = selectedChallenge.validateCode(currentCode);
    setValidationResult(passed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 select-none">
      <div className="bg-[#0B1524] border border-white/15 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#142338]">
          <div className="flex items-center gap-2 text-purple-400 font-extrabold text-base">
            <Award className="w-5 h-5" />
            <span>Educational Challenge Studio</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* List of Challenges */}
          <div className="space-y-2 border-r border-white/10 pr-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Select Mission</h4>
            {CHALLENGES.map((ch) => {
              const isSelected = ch.id === selectedChallenge.id;
              return (
                <button
                  key={ch.id}
                  onClick={() => {
                    setSelectedChallenge(ch);
                    setValidationResult(null);
                  }}
                  className={`w-full text-left p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-purple-500/20 border-purple-500 text-white shadow-lg'
                      : 'bg-[#08111D] border-white/5 text-slate-400 hover:text-white hover:border-white/15'
                  }`}
                >
                  <p className="font-extrabold">{ch.title}</p>
                  <span className="text-[10px] text-purple-300 font-normal">{ch.level}</span>
                </button>
              );
            })}
          </div>

          {/* Selected Challenge Details */}
          <div className="md:col-span-2 space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-white mb-1">{selectedChallenge.title}</h3>
              <p className="text-xs text-slate-300 mb-4">{selectedChallenge.description}</p>

              <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">Mission Objectives</h4>
              <div className="space-y-2">
                {selectedChallenge.objectives.map((obj, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-200 bg-[#08111D] p-2 rounded-lg border border-white/5">
                    <Circle className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>{obj}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Validation Feedback */}
            <div className="space-y-3 pt-4 border-t border-white/10">
              {validationResult !== null && (
                <div
                  className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 border ${
                    validationResult
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                  }`}
                >
                  {validationResult ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Challenge Completed! +100 XP Earned! 🏆</span>
                    </>
                  ) : (
                    <span>⚠️ Solution incomplete. Check your blocks and try again!</span>
                  )}
                </div>
              )}

              <button
                onClick={handleValidate}
                className="w-full py-3 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-extrabold text-xs shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Check Solution</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
