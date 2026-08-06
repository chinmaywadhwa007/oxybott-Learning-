import React from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthMeterProps {
  password: string;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  const requirements = [
    { label: '8 characters minimum', met: password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'One number', met: /[0-9]/.test(password) },
    { label: 'One special symbol', met: /[^A-Za-z0-9]/.test(password) },
  ];

  const metCount = requirements.filter((r) => r.met).length;

  const percentage = (metCount / requirements.length) * 100;

  const getBarColor = () => {
    if (metCount === 0) return 'bg-[#1E2E44]';
    if (metCount <= 2) return 'bg-rose-500';
    if (metCount === 3) return 'bg-amber-400';
    return 'bg-[#5BE4FF]';
  };

  return (
    <div className="w-full mt-2 space-y-2 select-none">
      {/* Strength Bar */}
      <div className="w-full h-1.5 bg-[#152438] rounded-full overflow-hidden flex">
        <div
          className={`h-full transition-all duration-300 ${getBarColor()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Live Requirements List */}
      <div className="grid grid-cols-2 gap-1.5 pt-1">
        {requirements.map((req, idx) => (
          <div key={idx} className="flex items-center gap-1.5 text-[11px]">
            {req.met ? (
              <Check className="w-3.5 h-3.5 text-[#5BE4FF] stroke-[3] shrink-0" />
            ) : (
              <X className="w-3.5 h-3.5 text-[#334155] stroke-[2] shrink-0" />
            )}
            <span className={req.met ? 'text-[#5BE4FF] font-semibold' : 'text-[#64748B] font-normal'}>
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
