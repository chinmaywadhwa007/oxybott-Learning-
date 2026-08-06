import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { simulationEngine, HardwareState } from './simulationEngine';
import { Play, Square, Cpu, Sliders, Radio, Volume2, Monitor, X, Zap, Activity, ActivityIcon } from 'lucide-react';

interface VirtualArduinoProps {
  code: string;
  onClose?: () => void;
}

export const VirtualArduino: React.FC<VirtualArduinoProps> = ({ code, onClose }) => {
  const [state, setState] = useState<HardwareState>(simulationEngine.getState());

  useEffect(() => {
    const unsubscribe = simulationEngine.subscribe((newState) => {
      setState(newState);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (code && state.isSimulating) {
      simulationEngine.startSimulation(code);
    }
  }, [code]);

  const toggleSim = () => {
    if (state.isSimulating) {
      simulationEngine.stopSimulation();
    } else {
      simulationEngine.startSimulation(code);
    }
  };

  const isLed13On = state.leds[13] || false;
  const isLed12On = state.leds[12] || false;
  const isLed11On = state.leds[11] || false;
  const servoAngle = state.servos[9] || 90;
  const buzzerFreq = state.buzzers[8] || 0;
  const isBuzzerActive = buzzerFreq > 0;

  return (
    <div className="flex flex-col h-full bg-[#080E18] text-slate-100 select-none overflow-y-auto p-3 space-y-3 font-sans text-xs custom-scrollbar">
      {/* 1. Hardware Bench Header */}
      <div className="h-9 px-3 bg-[#0B1424] border border-[#1E293B] rounded-lg flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-2 font-bold text-white">
          <Cpu className="w-4 h-4 text-[#38BDF8]" />
          <span>Hardware Bench</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#10B981]/10 text-emerald-400 font-mono">
            UNO R3
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleSim}
            className={`h-7 px-2.5 rounded-md font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
              state.isSimulating
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-sm'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
            }`}
          >
            {state.isSimulating ? (
              <>
                <Square className="w-3 h-3 fill-current" />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current" />
                <span>Run</span>
              </>
            )}
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="h-7 w-7 rounded-md hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Close Hardware Simulator"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Microcontroller Status Tile */}
      <div className="p-2.5 rounded-lg bg-[#0E1726] border border-[#1E293B] flex items-center justify-between text-xs shadow-sm">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              state.isSimulating ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
            }`}
          />
          <span className="font-bold text-white">
            {state.isSimulating ? 'SIMULATING (16MHz)' : 'STANDBY'}
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
          <span>ATmega328P</span>
          <span>·</span>
          <span className="text-[#38BDF8] font-bold">Step #{state.stepCount}</span>
        </div>
      </div>

      {/* 3. Arduino PCB Circuit Board Simulation Panel */}
      <div className="rounded-xl bg-gradient-to-b from-[#0A2540] to-[#06182B] border border-[#0EA5E9]/40 p-3 space-y-3 shadow-lg relative overflow-hidden">
        {/* PCB Header */}
        <div className="flex items-center justify-between text-xs border-b border-[#0EA5E9]/20 pb-2">
          <div className="flex items-center gap-1.5 text-[#38BDF8] font-black uppercase tracking-wider text-[11px]">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>ARDUINO UNO PCB</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 bg-black/40 px-2 py-0.5 rounded">REV 3</span>
        </div>

        {/* Board Onboard LEDs */}
        <div className="grid grid-cols-3 gap-2">
          {/* Built-in Pin 13 */}
          <div className="p-2 rounded-lg bg-[#07192C] border border-[#0EA5E9]/20 flex flex-col items-center gap-1 text-center">
            <span className="text-[10px] text-slate-400 font-bold">L (Pin 13)</span>
            <div
              className={`w-3.5 h-3.5 rounded-full transition-all ${
                isLed13On
                  ? 'bg-amber-400 shadow-[0_0_10px_#F59E0B]'
                  : 'bg-slate-700 opacity-40'
              }`}
            />
            <span className={`text-[10px] font-mono ${isLed13On ? 'text-amber-400 font-bold' : 'text-slate-500'}`}>
              {isLed13On ? 'HIGH' : 'LOW'}
            </span>
          </div>

          {/* LED Pin 12 */}
          <div className="p-2 rounded-lg bg-[#07192C] border border-[#0EA5E9]/20 flex flex-col items-center gap-1 text-center">
            <span className="text-[10px] text-slate-400 font-bold">LED (Pin 12)</span>
            <div
              className={`w-3.5 h-3.5 rounded-full transition-all ${
                isLed12On
                  ? 'bg-rose-500 shadow-[0_0_10px_#F43F5E]'
                  : 'bg-slate-700 opacity-40'
              }`}
            />
            <span className={`text-[10px] font-mono ${isLed12On ? 'text-rose-400 font-bold' : 'text-slate-500'}`}>
              {isLed12On ? 'HIGH' : 'LOW'}
            </span>
          </div>

          {/* LED Pin 11 */}
          <div className="p-2 rounded-lg bg-[#07192C] border border-[#0EA5E9]/20 flex flex-col items-center gap-1 text-center">
            <span className="text-[10px] text-slate-400 font-bold">LED (Pin 11)</span>
            <div
              className={`w-3.5 h-3.5 rounded-full transition-all ${
                isLed11On
                  ? 'bg-emerald-400 shadow-[0_0_10px_#10B981]'
                  : 'bg-slate-700 opacity-40'
              }`}
            />
            <span className={`text-[10px] font-mono ${isLed11On ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
              {isLed11On ? 'HIGH' : 'LOW'}
            </span>
          </div>
        </div>
      </div>

      {/* 4. SSD1306 OLED Display Screen Card */}
      <div className="p-3 rounded-xl bg-[#0B1424] border border-[#1E293B] space-y-2 shadow-sm">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-[#38BDF8] font-bold">
            <Monitor className="w-3.5 h-3.5" />
            <span>OLED Display (128x64 I2C)</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">0x3C</span>
        </div>

        <div className="bg-[#030914] border border-[#1E293B] rounded-lg p-2.5 h-16 font-mono text-[11px] text-[#38BDF8] flex flex-col justify-between">
          <div className="space-y-0.5">
            {state.oledText.map((line, idx) => (
              <div key={idx} className="truncate tracking-wide">
                {line}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between text-[9px] text-slate-600 border-t border-[#1E293B]/60 pt-0.5">
            <span>SSD1306</span>
            <span>128x64 PX</span>
          </div>
        </div>
      </div>

      {/* 5. LCD 16x2 Display Screen Card */}
      <div className="p-3 rounded-xl bg-[#0B1424] border border-[#1E293B] space-y-2 shadow-sm">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <Monitor className="w-3.5 h-3.5" />
            <span>LCD 16x2 Display (I2C)</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">0x27</span>
        </div>

        <div className="bg-[#092B18] border border-emerald-500/30 rounded-lg p-2.5 h-14 font-mono text-xs text-emerald-300 flex flex-col justify-center space-y-0.5">
          <div className="truncate font-bold">{state.lcdText[0] || 'Oxybott Visual'}</div>
          <div className="truncate text-emerald-400/80 text-[11px]">{state.lcdText[1] || 'System Ready...'}</div>
        </div>
      </div>

      {/* 6. Servo Motor & Piezo Buzzer Components */}
      <div className="grid grid-cols-2 gap-2">
        {/* Servo Motor (Pin 9) */}
        <div className="p-2.5 rounded-xl bg-[#0B1424] border border-[#1E293B] space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
            <div className="flex items-center gap-1 text-[#38BDF8]">
              <Sliders className="w-3 h-3" />
              <span>Servo (Pin 9)</span>
            </div>
            <span className="font-mono text-[#38BDF8] text-[10px]">{servoAngle}°</span>
          </div>

          <div className="h-1.5 bg-[#1E293B] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#38BDF8] transition-all duration-300"
              style={{ width: `${(servoAngle / 180) * 100}%` }}
            />
          </div>
        </div>

        {/* Piezo Buzzer (Pin 8) */}
        <div className="p-2.5 rounded-xl bg-[#0B1424] border border-[#1E293B] space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
            <div className="flex items-center gap-1 text-amber-400">
              <Volume2 className={`w-3 h-3 ${isBuzzerActive ? 'animate-bounce' : ''}`} />
              <span>Buzzer (Pin 8)</span>
            </div>
            <span className="font-mono text-slate-400 text-[10px]">
              {isBuzzerActive ? `${buzzerFreq}Hz` : 'Silent'}
            </span>
          </div>

          <div className="h-1.5 bg-[#1E293B] rounded-full overflow-hidden flex items-center px-0.5">
            {isBuzzerActive ? (
              <div className="w-full h-1 bg-amber-400 animate-pulse rounded-full" />
            ) : (
              <div className="w-2 h-1 bg-slate-600 rounded-full" />
            )}
          </div>
        </div>
      </div>

      {/* 7. Push Button (Pin 2) */}
      <div className="p-2.5 rounded-xl bg-[#0B1424] border border-[#1E293B] flex items-center justify-between shadow-sm">
        <button
          onMouseDown={() => simulationEngine.setButton(2, true)}
          onMouseUp={() => simulationEngine.setButton(2, false)}
          className="h-7 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 active:scale-95 text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
        >
          Push Button (Pin 2)
        </button>
        <span className="text-[11px] font-mono text-slate-400">
          <span className="text-white font-bold">{state.buttonState[2] ? 'PRESSED (0V)' : 'RELEASED (5V)'}</span>
        </span>
      </div>

      {/* 8. GPIO Pin Voltage Matrix */}
      <div className="p-2.5 rounded-xl bg-[#0B1424] border border-[#1E293B] space-y-2 shadow-sm">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 border-b border-[#1E293B]/60 pb-1.5">
          <div className="flex items-center gap-1.5 text-[#38BDF8]">
            <Activity className="w-3.5 h-3.5" />
            <span>GPIO Voltage Matrix</span>
          </div>
          <span className="text-[10px] text-slate-500">Live</span>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {Object.entries(state.gpioPins).map(([pinNum, pin]) => (
            <div
              key={pinNum}
              className={`p-1.5 rounded-md border flex items-center justify-between text-[10px] transition-colors ${
                pin.value > 0
                  ? 'bg-[#38BDF8]/10 border-[#38BDF8]/30 text-[#38BDF8]'
                  : 'bg-[#111A2E] border-[#1E293B] text-slate-400'
              }`}
            >
              <span className="font-bold">Pin {pinNum}</span>
              <span className="font-mono text-[9px]">{pin.voltage.toFixed(1)}V</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
