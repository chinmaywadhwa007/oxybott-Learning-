import * as Blockly from 'blockly';

export function registerPeripheralBlocks() {
  // Communication: Serial Begin
  Blockly.Blocks['serial_begin'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('📡 Serial Begin Baud Rate')
        .appendField(
          new Blockly.FieldDropdown([
            ['9600', '9600'],
            ['115200', '115200'],
            ['19200', '19200'],
            ['57600', '57600'],
          ]),
          'BAUD'
        );
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('communication_blocks');
    },
  };

  // Serial Println
  Blockly.Blocks['serial_println'] = {
    init: function () {
      this.appendValueInput('TEXT').setCheck(null).appendField('📡 Serial Println');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('communication_blocks');
    },
  };

  // Serial Print
  Blockly.Blocks['serial_print'] = {
    init: function () {
      this.appendValueInput('TEXT').setCheck(null).appendField('📡 Serial Print');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('communication_blocks');
    },
  };

  // Serial Read
  Blockly.Blocks['serial_read'] = {
    init: function () {
      this.appendDummyInput().appendField('📡 Serial Read ()');
      this.setOutput(true, 'Number');
      this.setStyle('communication_blocks');
    },
  };

  // Displays: LCD Init
  Blockly.Blocks['lcd_init'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('📺 LCD I2C Init (Address 0x27, 16x2)');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('display_blocks');
    },
  };

  // LCD Print
  Blockly.Blocks['lcd_print'] = {
    init: function () {
      this.appendValueInput('TEXT')
        .setCheck(null)
        .appendField('📺 LCD Print at Col')
        .appendField(new Blockly.FieldNumber(0, 0, 15), 'COL')
        .appendField('Row')
        .appendField(new Blockly.FieldNumber(0, 0, 1), 'ROW');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('display_blocks');
    },
  };

  // LCD Clear
  Blockly.Blocks['lcd_clear'] = {
    init: function () {
      this.appendDummyInput().appendField('📺 LCD Clear');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('display_blocks');
    },
  };

  // OLED Init
  Blockly.Blocks['oled_init'] = {
    init: function () {
      this.appendDummyInput().appendField('🖥️ OLED SSD1306 Init (128x64)');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('display_blocks');
    },
  };

  // OLED Print
  Blockly.Blocks['oled_print'] = {
    init: function () {
      this.appendValueInput('TEXT').setCheck(null).appendField('🖥️ OLED Print');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('display_blocks');
    },
  };

  // Motors: Servo Attach
  Blockly.Blocks['servo_attach'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('⚙️ Attach Servo on Pin')
        .appendField(new Blockly.FieldNumber(9, 0, 53), 'PIN');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('motor_blocks');
    },
  };

  // Servo Write Angle
  Blockly.Blocks['servo_write'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('⚙️ Set Servo Angle')
        .appendField(new Blockly.FieldNumber(90, 0, 180), 'ANGLE')
        .appendField('° on Pin')
        .appendField(new Blockly.FieldNumber(9, 0, 53), 'PIN');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('motor_blocks');
    },
  };

  // Buzzer Tone
  Blockly.Blocks['buzzer_tone'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('🔊 Play Tone Pin')
        .appendField(new Blockly.FieldNumber(8, 0, 53), 'PIN')
        .appendField('Freq')
        .appendField(new Blockly.FieldNumber(440, 10, 10000), 'FREQ')
        .appendField('Hz');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('motor_blocks');
    },
  };

  // Buzzer No Tone
  Blockly.Blocks['buzzer_notone'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('🔇 Stop Tone Pin')
        .appendField(new Blockly.FieldNumber(8, 0, 53), 'PIN');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('motor_blocks');
    },
  };

  // Sensors: Ultrasonic HC-SR04
  Blockly.Blocks['sensor_ultrasonic'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('🦇 Ultrasonic Distance (cm) Trig')
        .appendField(new Blockly.FieldNumber(7, 0, 53), 'TRIG')
        .appendField('Echo')
        .appendField(new Blockly.FieldNumber(6, 0, 53), 'ECHO');
      this.setOutput(true, 'Number');
      this.setStyle('sensor_blocks');
    },
  };

  // Sensor: DHT Temp / Humidity
  Blockly.Blocks['sensor_dht'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('🌡️ Read DHT Sensor')
        .appendField(
          new Blockly.FieldDropdown([
            ['Temperature (°C)', 'TEMP'],
            ['Humidity (%)', 'HUM'],
          ]),
          'TYPE'
        )
        .appendField('Pin')
        .appendField(new Blockly.FieldNumber(4, 0, 53), 'PIN');
      this.setOutput(true, 'Number');
      this.setStyle('sensor_blocks');
    },
  };

  // Sensor: LDR Light Sensor
  Blockly.Blocks['sensor_ldr'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('☀️ Read LDR Light Pin')
        .appendField(
          new Blockly.FieldDropdown([
            ['A0', 'A0'],
            ['A1', 'A1'],
            ['A2', 'A2'],
          ]),
          'PIN'
        );
      this.setOutput(true, 'Number');
      this.setStyle('sensor_blocks');
    },
  };

  // Sensor: Pushbutton State
  Blockly.Blocks['sensor_button'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('🔘 Button Pressed Pin')
        .appendField(new Blockly.FieldNumber(2, 0, 53), 'PIN');
      this.setOutput(true, 'Boolean');
      this.setStyle('sensor_blocks');
    },
  };

  // IoT: WiFi Connect
  Blockly.Blocks['wifi_connect'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('🌐 Connect WiFi SSID')
        .appendField(new Blockly.FieldTextInput('MyNetwork'), 'SSID')
        .appendField('Pass')
        .appendField(new Blockly.FieldTextInput('Secret123'), 'PASS');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('iot_blocks');
    },
  };

  // IoT: HTTP GET Request
  Blockly.Blocks['http_get'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('🌐 HTTP GET URL')
        .appendField(new Blockly.FieldTextInput('http://api.example.com/data'), 'URL');
      this.setOutput(true, 'String');
      this.setStyle('iot_blocks');
    },
  };

  // IoT: ThingSpeak Update
  Blockly.Blocks['thingspeak_update'] = {
    init: function () {
      this.appendValueInput('VAL1').setCheck('Number').appendField('☁️ ThingSpeak Write Field 1');
      this.appendDummyInput()
        .appendField('API Key')
        .appendField(new Blockly.FieldTextInput('API_KEY_HERE'), 'KEY');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('iot_blocks');
    },
  };

  // Advanced: Raw C++ Snippet
  Blockly.Blocks['custom_cpp_code'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('💻 Raw C++')
        .appendField(new Blockly.FieldTextInput('digitalWrite(13, HIGH);'), 'CODE');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('advanced_blocks');
    },
  };
}
