import * as Blockly from 'blockly';

export const oxybottTheme = Blockly.Theme.defineTheme('oxybott_dark', {
  name: 'oxybott_dark',
  base: Blockly.Themes.Classic,
  componentStyles: {
    workspaceBackgroundColour: '#091320',
    toolboxBackgroundColour: '#0B1524',
    toolboxForegroundColour: '#9BA9C2',
    flyoutBackgroundColour: '#0F1E33',
    flyoutForegroundColour: '#E2E8F0',
    flyoutOpacity: 0.95,
    scrollbarColour: '#1E293B',
    scrollbarOpacity: 0.8,
    insertionMarkerColour: '#5BE4FF',
    insertionMarkerOpacity: 0.4,
    markerColour: '#5BE4FF',
    cursorColour: '#5BE4FF',
    selectedGlowColour: '#5BE4FF',
  },
  blockStyles: {
    program_blocks: {
      colourPrimary: '#6366F1',
      colourSecondary: '#4F46E5',
      colourTertiary: '#4338CA',
    },
    gpio_blocks: {
      colourPrimary: '#06B6D4',
      colourSecondary: '#0891B2',
      colourTertiary: '#0E7490',
    },
    timing_blocks: {
      colourPrimary: '#F59E0B',
      colourSecondary: '#D97706',
      colourTertiary: '#B45309',
    },
    math_blocks: {
      colourPrimary: '#3B82F6',
      colourSecondary: '#2563EB',
      colourTertiary: '#1D4ED8',
    },
    logic_blocks: {
      colourPrimary: '#10B981',
      colourSecondary: '#059669',
      colourTertiary: '#047857',
    },
    loop_blocks: {
      colourPrimary: '#8B5CF6',
      colourSecondary: '#7C3AED',
      colourTertiary: '#6D28D9',
    },
    variable_blocks: {
      colourPrimary: '#EC4899',
      colourSecondary: '#DB2777',
      colourTertiary: '#BE185D',
    },
    procedure_blocks: {
      colourPrimary: '#F97316',
      colourSecondary: '#EA580C',
      colourTertiary: '#C2410C',
    },
    communication_blocks: {
      colourPrimary: '#14B8A6',
      colourSecondary: '#0D9488',
      colourTertiary: '#0F766E',
    },
    display_blocks: {
      colourPrimary: '#A855F7',
      colourSecondary: '#9333EA',
      colourTertiary: '#7E22CE',
    },
    motor_blocks: {
      colourPrimary: '#EF4444',
      colourSecondary: '#DC2626',
      colourTertiary: '#B91C1C',
    },
    sensor_blocks: {
      colourPrimary: '#84CC16',
      colourSecondary: '#65A30D',
      colourTertiary: '#4D7C0F',
    },
    iot_blocks: {
      colourPrimary: '#0284C7',
      colourSecondary: '#0369A1',
      colourTertiary: '#075985',
    },
    advanced_blocks: {
      colourPrimary: '#64748B',
      colourSecondary: '#475569',
      colourTertiary: '#334155',
    },
  },
  categoryStyles: {},
});

export const acecodeTheme = oxybottTheme;
