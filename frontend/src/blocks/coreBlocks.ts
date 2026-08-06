import * as Blockly from 'blockly';

export function registerCoreBlocks() {
  // Setup & Loop Container Block
  Blockly.Blocks['arduino_setup_loop'] = {
    init: function () {
      this.appendDummyInput().appendField('⚡ Setup');
      this.appendStatementInput('SETUP').setCheck(null);
      this.appendDummyInput().appendField('🔄 Loop');
      this.appendStatementInput('LOOP').setCheck(null);
      this.setStyle('program_blocks');
      this.setTooltip('Main Arduino sketch entry points setup() and loop()');
      this.setHelpUrl('');
    },
  };

  Blockly.Blocks['arduino_setup'] = {
    init: function () {
      this.appendDummyInput().appendField('⚡ Setup');
      this.appendStatementInput('SETUP').setCheck(null);
      this.setStyle('program_blocks');
      this.setTooltip('Runs once when board powers up');
    },
  };

  Blockly.Blocks['arduino_loop'] = {
    init: function () {
      this.appendDummyInput().appendField('🔄 Loop');
      this.appendStatementInput('LOOP').setCheck(null);
      this.setStyle('program_blocks');
      this.setTooltip('Runs continuously in a loop');
    },
  };

  // GPIO Pin Mode
  Blockly.Blocks['pin_mode'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Set Pin')
        .appendField(new Blockly.FieldNumber(13, 0, 53), 'PIN')
        .appendField('Mode')
        .appendField(
          new Blockly.FieldDropdown([
            ['OUTPUT', 'OUTPUT'],
            ['INPUT', 'INPUT'],
            ['INPUT_PULLUP', 'INPUT_PULLUP'],
          ]),
          'MODE'
        );
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('gpio_blocks');
      this.setTooltip('Configure pin direction (INPUT or OUTPUT)');
    },
  };

  // Digital Write HIGH / LOW shortcuts
  Blockly.Blocks['digital_write_high'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Digital Write Pin')
        .appendField(new Blockly.FieldNumber(13, 0, 53), 'PIN')
        .appendField('HIGH 💡');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('gpio_blocks');
    },
  };

  Blockly.Blocks['digital_write_low'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Digital Write Pin')
        .appendField(new Blockly.FieldNumber(13, 0, 53), 'PIN')
        .appendField('LOW 🔌');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('gpio_blocks');
    },
  };

  // Dynamic Digital Write
  Blockly.Blocks['digital_write'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Digital Write Pin')
        .appendField(new Blockly.FieldNumber(13, 0, 53), 'PIN')
        .appendField('to')
        .appendField(
          new Blockly.FieldDropdown([
            ['HIGH', 'HIGH'],
            ['LOW', 'LOW'],
          ]),
          'STATE'
        );
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('gpio_blocks');
    },
  };

  // Digital Read
  Blockly.Blocks['digital_read'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Digital Read Pin')
        .appendField(new Blockly.FieldNumber(2, 0, 53), 'PIN');
      this.setOutput(true, 'Boolean');
      this.setStyle('gpio_blocks');
    },
  };

  // Analog Read
  Blockly.Blocks['analog_read'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Analog Read Pin')
        .appendField(
          new Blockly.FieldDropdown([
            ['A0', 'A0'],
            ['A1', 'A1'],
            ['A2', 'A2'],
            ['A3', 'A3'],
            ['A4', 'A4'],
            ['A5', 'A5'],
          ]),
          'PIN'
        );
      this.setOutput(true, 'Number');
      this.setStyle('gpio_blocks');
    },
  };

  // Analog Write (PWM)
  Blockly.Blocks['analog_write'] = {
    init: function () {
      this.appendValueInput('VALUE')
        .setCheck('Number')
        .appendField('Analog Write PWM Pin')
        .appendField(new Blockly.FieldNumber(9, 0, 53), 'PIN')
        .appendField('Value (0-255)');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('gpio_blocks');
    },
  };

  // Timing: Delay MS
  Blockly.Blocks['delay_ms'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('⏱️ Delay')
        .appendField(new Blockly.FieldNumber(1000, 0), 'DELAY_TIME')
        .appendField('ms');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('timing_blocks');
    },
  };

  // Delay Microseconds
  Blockly.Blocks['delay_us'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('⏱️ Delay Microseconds')
        .appendField(new Blockly.FieldNumber(100, 0), 'DELAY_TIME')
        .appendField('µs');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('timing_blocks');
    },
  };

  // Millis
  Blockly.Blocks['millis'] = {
    init: function () {
      this.appendDummyInput().appendField('⏱️ Millis ()');
      this.setOutput(true, 'Number');
      this.setStyle('timing_blocks');
    },
  };

  // Micros
  Blockly.Blocks['micros'] = {
    init: function () {
      this.appendDummyInput().appendField('⏱️ Micros ()');
      this.setOutput(true, 'Number');
      this.setStyle('timing_blocks');
    },
  };

  // Math extra: Map function
  Blockly.Blocks['math_map'] = {
    init: function () {
      this.appendValueInput('VALUE').setCheck('Number').appendField('Map value');
      this.appendValueInput('FROM_LOW').setCheck('Number').appendField('from [');
      this.appendValueInput('FROM_HIGH').setCheck('Number').appendField('..');
      this.appendValueInput('TO_LOW').setCheck('Number').appendField('] to [');
      this.appendValueInput('TO_HIGH').setCheck('Number').appendField('..');
      this.appendDummyInput().appendField(']');
      this.setInputsInline(true);
      this.setOutput(true, 'Number');
      this.setStyle('math_blocks');
    },
  };

  // Math extra: Constrain function
  Blockly.Blocks['math_constrain'] = {
    init: function () {
      this.appendValueInput('VALUE').setCheck('Number').appendField('Constrain');
      this.appendValueInput('LOW').setCheck('Number').appendField('min');
      this.appendValueInput('HIGH').setCheck('Number').appendField('max');
      this.setInputsInline(true);
      this.setOutput(true, 'Number');
      this.setStyle('math_blocks');
    },
  };
}
