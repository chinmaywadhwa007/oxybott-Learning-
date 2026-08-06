export interface BeginnerHint {
  id: string;
  condition: (code: string) => boolean;
  message: string;
  type: 'warning' | 'tip' | 'info';
}

export const BEGINNER_HINTS: BeginnerHint[] = [
  {
    id: 'missing_pin_mode',
    condition: (code: string) => code.includes('digitalWrite') && !code.includes('pinMode'),
    message: '⚠️ Beginner Tip: Remember to configure your pin with "Set Pin Mode" inside Setup before using Digital Write!',
    type: 'warning',
  },
  {
    id: 'fast_blink',
    condition: (code: string) => code.includes('digitalWrite') && !code.includes('delay'),
    message: '💡 Beginner Tip: Without a "Delay" block inside your loop, the LED blinks faster than human eyes can see!',
    type: 'tip',
  },
  {
    id: 'serial_missing_begin',
    condition: (code: string) => code.includes('Serial.print') && !code.includes('Serial.begin'),
    message: '📡 Beginner Tip: Initialize serial communication with "Serial Begin 9600" in Setup to read Serial logs!',
    type: 'info',
  },
  {
    id: 'lcd_missing_init',
    condition: (code: string) => code.includes('lcd.print') && !code.includes('lcd.init'),
    message: '📺 Beginner Tip: You must include "LCD I2C Init" in Setup before printing text to an LCD display!',
    type: 'warning',
  },
];

export function getActiveHints(code: string): BeginnerHint[] {
  return BEGINNER_HINTS.filter((h) => h.condition(code));
}
