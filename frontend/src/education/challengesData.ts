export interface Challenge {
  id: string;
  title: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  objectives: string[];
  validateCode: (code: string) => boolean;
}

export const CHALLENGES: Challenge[] = [
  {
    id: 'blink_led',
    title: 'Blink Pin 13 LED',
    level: 'Beginner',
    description: 'Build a program that turns the built-in pin 13 LED ON for 1 second, then OFF for 1 second continuously.',
    objectives: [
      'Set Pin 13 mode to OUTPUT in Setup',
      'Digital Write HIGH to Pin 13 in Loop',
      'Add 1000ms Delay',
      'Digital Write LOW to Pin 13',
      'Add 1000ms Delay',
    ],
    validateCode: (code: string) =>
      code.includes('pinMode(13, OUTPUT)') &&
      code.includes('digitalWrite(13, HIGH)') &&
      code.includes('digitalWrite(13, LOW)') &&
      code.includes('delay(1000)'),
  },
  {
    id: 'traffic_light',
    title: 'Traffic Light Sequence',
    level: 'Beginner',
    description: 'Control three pins (Pin 12 Red, Pin 11 Yellow, Pin 10 Green) to simulate a traffic light cycle.',
    objectives: [
      'Set Pin 12, 11, 10 to OUTPUT',
      'Turn Red ON for 2000ms',
      'Turn Yellow ON for 1000ms',
      'Turn Green ON for 2000ms',
    ],
    validateCode: (code: string) =>
      code.includes('pinMode(12, OUTPUT)') &&
      code.includes('pinMode(11, OUTPUT)') &&
      code.includes('pinMode(10, OUTPUT)'),
  },
  {
    id: 'servo_sweep',
    title: 'Servo Motor Sweep',
    level: 'Intermediate',
    description: 'Attach a servo motor on Pin 9 and sweep its position from 0° to 180° and back.',
    objectives: [
      'Attach Servo to Pin 9',
      'Write Servo Angle 0°',
      'Add 500ms Delay',
      'Write Servo Angle 180°',
    ],
    validateCode: (code: string) => code.includes('Servo servo_9') && code.includes('servo_9.attach(9)'),
  },
  {
    id: 'serial_counter',
    title: 'Serial Debug Monitor',
    level: 'Beginner',
    description: 'Initialize serial communication at 9600 baud rate and print a welcome message.',
    objectives: ['Call Serial.begin(9600) in Setup', 'Print text using Serial Println in Loop'],
    validateCode: (code: string) => code.includes('Serial.begin(9600)') && code.includes('Serial.println'),
  },
];
