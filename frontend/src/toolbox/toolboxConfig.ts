export const oxybottToolbox = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: 'Program',
      colour: '#6366F1',
      contents: [
        { kind: 'block', type: 'arduino_setup_loop' },
        { kind: 'block', type: 'arduino_setup' },
        { kind: 'block', type: 'arduino_loop' },
      ],
    },
    {
      kind: 'category',
      name: 'GPIO',
      colour: '#06B6D4',
      contents: [
        { kind: 'block', type: 'pin_mode' },
        { kind: 'block', type: 'digital_write_high' },
        { kind: 'block', type: 'digital_write_low' },
        { kind: 'block', type: 'digital_write' },
        { kind: 'block', type: 'digital_read' },
        { kind: 'block', type: 'analog_read' },
        { kind: 'block', type: 'analog_write' },
      ],
    },
    {
      kind: 'category',
      name: 'Timing',
      colour: '#F59E0B',
      contents: [
        { kind: 'block', type: 'delay_ms' },
        { kind: 'block', type: 'delay_us' },
        { kind: 'block', type: 'millis' },
        { kind: 'block', type: 'micros' },
      ],
    },
    {
      kind: 'category',
      name: 'Logic',
      colour: '#10B981',
      contents: [
        { kind: 'block', type: 'controls_if' },
        { kind: 'block', type: 'logic_compare' },
        { kind: 'block', type: 'logic_operation' },
        { kind: 'block', type: 'logic_boolean' },
        { kind: 'block', type: 'logic_negate' },
      ],
    },
    {
      kind: 'category',
      name: 'Loops',
      colour: '#8B5CF6',
      contents: [
        { kind: 'block', type: 'controls_repeat_ext' },
        { kind: 'block', type: 'controls_whileUntil' },
        { kind: 'block', type: 'controls_for' },
        { kind: 'block', type: 'controls_flow_statements' },
      ],
    },
    {
      kind: 'category',
      name: 'Math',
      colour: '#3B82F6',
      contents: [
        { kind: 'block', type: 'math_number' },
        { kind: 'block', type: 'math_arithmetic' },
        { kind: 'block', type: 'math_random_int' },
        { kind: 'block', type: 'math_map' },
        { kind: 'block', type: 'math_constrain' },
        { kind: 'block', type: 'math_round' },
      ],
    },
    {
      kind: 'category',
      name: 'Variables',
      custom: 'VARIABLE',
      colour: '#EC4899',
    },
    {
      kind: 'category',
      name: 'Functions',
      custom: 'PROCEDURE',
      colour: '#F97316',
    },
    {
      kind: 'category',
      name: 'Communication',
      colour: '#14B8A6',
      contents: [
        { kind: 'block', type: 'serial_begin' },
        { kind: 'block', type: 'serial_println' },
        { kind: 'block', type: 'serial_print' },
        { kind: 'block', type: 'serial_read' },
      ],
    },
    {
      kind: 'category',
      name: 'Displays',
      colour: '#A855F7',
      contents: [
        { kind: 'block', type: 'lcd_init' },
        { kind: 'block', type: 'lcd_print' },
        { kind: 'block', type: 'lcd_clear' },
        { kind: 'block', type: 'oled_init' },
        { kind: 'block', type: 'oled_print' },
      ],
    },
    {
      kind: 'category',
      name: 'Motors',
      colour: '#EF4444',
      contents: [
        { kind: 'block', type: 'servo_attach' },
        { kind: 'block', type: 'servo_write' },
        { kind: 'block', type: 'buzzer_tone' },
        { kind: 'block', type: 'buzzer_notone' },
      ],
    },
    {
      kind: 'category',
      name: 'Sensors',
      colour: '#84CC16',
      contents: [
        { kind: 'block', type: 'sensor_ultrasonic' },
        { kind: 'block', type: 'sensor_dht' },
        { kind: 'block', type: 'sensor_ldr' },
        { kind: 'block', type: 'sensor_button' },
      ],
    },
    {
      kind: 'category',
      name: 'IoT',
      colour: '#0284C7',
      contents: [
        { kind: 'block', type: 'wifi_connect' },
        { kind: 'block', type: 'http_get' },
        { kind: 'block', type: 'thingspeak_update' },
      ],
    },
    {
      kind: 'category',
      name: 'Advanced',
      colour: '#64748B',
      contents: [
        { kind: 'block', type: 'custom_cpp_code' },
      ],
    },
  ],
};

export const acecodeToolbox = oxybottToolbox;
