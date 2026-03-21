const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#000',
    background: '#fff',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
    primary: '#0D9488', // Teal-600 for health theme
    secondary: '#0F766E', // Teal-700
    accent: '#38BDF8', // Sky-400
    surface: '#F8FAFC', // Slate-50
    error: '#EF4444',
  },
  dark: {
    text: '#fff',
    background: '#0F172A', // Slate-900
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
    primary: '#14B8A6', // Teal-500
    secondary: '#0D9488', // Teal-600
    accent: '#7DD3FC', // Sky-300
    surface: '#1E293B', // Slate-800
    error: '#F87171',
  },
};
