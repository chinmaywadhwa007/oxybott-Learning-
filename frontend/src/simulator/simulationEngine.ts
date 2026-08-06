export interface GpioPinState {
  mode: 'INPUT' | 'OUTPUT' | 'INPUT_PULLUP';
  value: number; // 0 (LOW) or 1 (HIGH) or 0-255 (PWM)
  voltage: number; // 0.0V - 5.0V
}

export interface HardwareState {
  leds: Record<number, boolean>;
  servos: Record<number, number>; // angle 0-180
  buzzers: Record<number, number>; // frequency
  lcdText: string[];
  oledText: string[];
  ultrasonicDistance: number;
  buttonState: Record<number, boolean>;
  potentiometerValue: number; // 0-1023
  isSimulating: boolean;
  activeLine?: number;
  clockCycles: number;
  stepCount: number;
  gpioPins: Record<number, GpioPinState>;
  mcuModel: string;
}

export type HardwareListener = (state: HardwareState) => void;

class SimulationEngine {
  private state: HardwareState = {
    leds: { 13: false, 12: false, 11: false },
    servos: { 9: 90 },
    buzzers: { 8: 0 },
    lcdText: ['Oxybott Visual', 'Embedded System'],
    oledText: ['Oxybott OLED v1.0', '128x64 SSD1306', 'Status: RUNNING'],
    ultrasonicDistance: 25,
    buttonState: { 2: false },
    potentiometerValue: 512,
    isSimulating: false,
    clockCycles: 0,
    stepCount: 0,
    mcuModel: 'ATmega328P (16MHz)',
    gpioPins: {
      0: { mode: 'INPUT', value: 0, voltage: 0.0 },
      1: { mode: 'OUTPUT', value: 0, voltage: 0.0 },
      2: { mode: 'INPUT_PULLUP', value: 1, voltage: 5.0 },
      3: { mode: 'OUTPUT', value: 0, voltage: 0.0 },
      8: { mode: 'OUTPUT', value: 0, voltage: 0.0 },
      9: { mode: 'OUTPUT', value: 1, voltage: 2.5 },
      11: { mode: 'OUTPUT', value: 0, voltage: 0.0 },
      12: { mode: 'OUTPUT', value: 0, voltage: 0.0 },
      13: { mode: 'OUTPUT', value: 0, voltage: 0.0 },
    },
  };

  private listeners: Set<HardwareListener> = new Set();
  private timer: any = null;
  private stepIndex = 0;

  public subscribe(listener: HardwareListener) {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l({ ...this.state }));
  }

  public getState() {
    return this.state;
  }

  public setButton(pin: number, pressed: boolean) {
    this.state.buttonState[pin] = pressed;
    if (this.state.gpioPins[pin]) {
      this.state.gpioPins[pin].value = pressed ? 0 : 1; // Pullup logic
      this.state.gpioPins[pin].voltage = pressed ? 0.0 : 5.0;
    }
    this.notify();
  }

  public setPotentiometer(val: number) {
    this.state.potentiometerValue = val;
    this.notify();
  }

  public setDistance(dist: number) {
    this.state.ultrasonicDistance = dist;
    this.notify();
  }

  public startSimulation(code: string) {
    this.stopSimulation();
    this.state.isSimulating = true;
    this.state.clockCycles = 1600;
    this.notify();

    // Parse simulation steps from C++ code lines
    const steps = this.parseStepsFromCode(code);
    if (steps.length === 0) return;

    this.stepIndex = 0;
    const runNextStep = () => {
      if (!this.state.isSimulating) return;

      const step = steps[this.stepIndex % steps.length];
      this.stepIndex++;
      this.state.stepCount++;
      this.state.clockCycles += 16000;

      if (step.type === 'LED' && step.state !== undefined) {
        this.state.leds[step.pin] = step.state;
        if (this.state.gpioPins[step.pin]) {
          this.state.gpioPins[step.pin].value = step.state ? 1 : 0;
          this.state.gpioPins[step.pin].voltage = step.state ? 5.0 : 0.0;
        }
      } else if (step.type === 'SERVO' && step.angle !== undefined) {
        this.state.servos[step.pin] = step.angle;
      } else if (step.type === 'BUZZER' && step.freq !== undefined) {
        this.state.buzzers[step.pin] = step.freq;
      } else if (step.type === 'LCD') {
        this.state.lcdText = [step.line1 || 'Oxybott Studio', step.line2 || 'Visual Program'];
      } else if (step.type === 'OLED') {
        this.state.oledText = [step.line1 || 'SSD1306 Display', step.line2 || 'Oxybott Engine', 'Mode: ACTIVE'];
      }

      this.notify();
      this.timer = setTimeout(runNextStep, step.delay || 800);
    };

    runNextStep();
  }

  public stopSimulation() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.state.isSimulating = false;
    this.state.leds[13] = false;
    this.state.leds[12] = false;
    this.state.leds[11] = false;
    this.state.buzzers[8] = 0;
    this.notify();
  }

  private parseStepsFromCode(code: string) {
    const steps: Array<{
      type: 'LED' | 'SERVO' | 'BUZZER' | 'LCD' | 'OLED';
      pin: number;
      state?: boolean;
      angle?: number;
      freq?: number;
      line1?: string;
      line2?: string;
      delay?: number;
    }> = [];

    const lines = code.split('\n');
    let currentDelay = 800;

    for (const line of lines) {
      if (line.includes('delay(')) {
        const match = line.match(/delay\((\d+)\)/);
        if (match) currentDelay = Math.max(250, parseInt(match[1], 10));
      } else if (line.includes('digitalWrite')) {
        const match = line.match(/digitalWrite\((\d+),\s*(HIGH|LOW)\)/);
        if (match) {
          const pin = parseInt(match[1], 10);
          const state = match[2] === 'HIGH';
          steps.push({ type: 'LED', pin, state, delay: currentDelay });
        }
      } else if (line.includes('servo_') && line.includes('.write(')) {
        const match = line.match(/servo_(\d+)\.write\((\d+)\)/);
        if (match) {
          steps.push({ type: 'SERVO', pin: parseInt(match[1], 10), angle: parseInt(match[2], 10), delay: currentDelay });
        }
      } else if (line.includes('tone(')) {
        const match = line.match(/tone\((\d+),\s*(\d+)\)/);
        if (match) {
          steps.push({ type: 'BUZZER', pin: parseInt(match[1], 10), freq: parseInt(match[2], 10), delay: currentDelay });
        }
      } else if (line.includes('lcd.print(')) {
        const match = line.match(/lcd\.print\((.*)\)/);
        if (match) {
          steps.push({ type: 'LCD', pin: 0, line1: match[1].replace(/"/g, ''), delay: currentDelay });
        }
      } else if (line.includes('display.print') || line.includes('display.drawString')) {
        const match = line.match(/display\.(?:print|drawString)\((.*)\)/);
        if (match) {
          steps.push({ type: 'OLED', pin: 0, line1: match[1].replace(/"/g, ''), delay: currentDelay });
        }
      }
    }

    if (steps.length === 0) {
      // Default blink steps
      steps.push({ type: 'LED', pin: 13, state: true, delay: 1000 });
      steps.push({ type: 'LED', pin: 13, state: false, delay: 1000 });
    }

    return steps;
  }
}

export const simulationEngine = new SimulationEngine();
