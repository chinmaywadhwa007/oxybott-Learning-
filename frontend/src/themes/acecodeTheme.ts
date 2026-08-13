import * as Blockly from 'blockly';

export const oxybottTheme = Blockly.Theme.defineTheme('oxybott_light', {
  name: 'oxybott_light',
  base: Blockly.Themes.Classic,
  componentStyles: {
    workspaceBackgroundColour: '#ffffff',
    toolboxBackgroundColour: '#f8fafc',
    toolboxForegroundColour: '#1e293b',
    flyoutBackgroundColour: '#f8fafc',
    flyoutForegroundColour: '#1e293b',
    flyoutOpacity: 0.98,
    scrollbarColour: '#cbd5e1',
    scrollbarOpacity: 0.8,
    insertionMarkerColour: '#007acc',
    insertionMarkerOpacity: 0.5,
    markerColour: '#007acc',
    cursorColour: '#007acc',
    selectedGlowColour: '#007acc',
  },
  blockStyles: {
    program_blocks: {
      colourPrimary: '#ffab19',
      colourSecondary: '#e69917',
      colourTertiary: '#cc8814',
    },
    gpio_blocks: {
      colourPrimary: '#4c97ff',
      colourSecondary: '#3b82f6',
      colourTertiary: '#2563eb',
    },
    timing_blocks: {
      colourPrimary: '#ff8c1a',
      colourSecondary: '#e67e17',
      colourTertiary: '#cc7014',
    },
    math_blocks: {
      colourPrimary: '#59c059',
      colourSecondary: '#4cb963',
      colourTertiary: '#3fa352',
    },
    logic_blocks: {
      colourPrimary: '#ffab19',
      colourSecondary: '#e69917',
      colourTertiary: '#cc8814',
    },
    loop_blocks: {
      colourPrimary: '#ffab19',
      colourSecondary: '#e69917',
      colourTertiary: '#cc8814',
    },
    variable_blocks: {
      colourPrimary: '#ff8c1a',
      colourSecondary: '#e67e17',
      colourTertiary: '#cc7014',
    },
    procedure_blocks: {
      colourPrimary: '#ff4d6a',
      colourSecondary: '#e6455f',
      colourTertiary: '#cc3d54',
    },
    communication_blocks: {
      colourPrimary: '#0284c7',
      colourSecondary: '#0369a1',
      colourTertiary: '#075985',
    },
    display_blocks: {
      colourPrimary: '#9333ea',
      colourSecondary: '#7e22ce',
      colourTertiary: '#6b21a8',
    },
    motor_blocks: {
      colourPrimary: '#ffab19',
      colourSecondary: '#e69917',
      colourTertiary: '#cc8814',
    },
    sensor_blocks: {
      colourPrimary: '#59c059',
      colourSecondary: '#4cb963',
      colourTertiary: '#3fa352',
    },
    iot_blocks: {
      colourPrimary: '#4c97ff',
      colourSecondary: '#3b82f6',
      colourTertiary: '#2563eb',
    },
    advanced_blocks: {
      colourPrimary: '#64748b',
      colourSecondary: '#475569',
      colourTertiary: '#334155',
    },
  },
  categoryStyles: {},
});

export const acecodeTheme = oxybottTheme;

