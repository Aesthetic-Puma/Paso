export const Colors = {
  bg: '#F3EFE7',
  card: '#FBF9F4',
  border: '#ECE7DC',
  dark: '#211E18',
  accent: '#E08A3C',
  muted: '#8c8678',
  mutedLight: '#a59f90',
  gold: '#a89a45',
  green: '#468C5A',
  greenLight: '#e8f5ed',
  red: '#B2452F',
  redLight: '#fbede9',
  redText: '#9c4631',
  orange: '#E08A3C',
  separator: 'rgba(33,30,24,0.06)',
  shadow: 'rgba(33,30,24,0.08)',
  tabBg: '#FBF9F4',
  tabBorder: 'rgba(33,30,24,0.07)',
  inputBg: '#ECE7DC',
  white: '#ffffff',
};

export const scoreColor = (score: number) => {
  if (score >= 70) return Colors.green;
  if (score >= 45) return Colors.accent;
  return Colors.red;
};

export const scoreBg = (score: number) => {
  if (score >= 70) return Colors.greenLight;
  if (score >= 45) return '#fff3e8';
  return Colors.redLight;
};

export const Fonts = {
  sans: 'HankenGrotesk_400Regular',
  sansMedium: 'HankenGrotesk_500Medium',
  sansSemiBold: 'HankenGrotesk_600SemiBold',
  sansBold: 'HankenGrotesk_700Bold',
  serif: 'Newsreader_400Regular',
  serifMedium: 'Newsreader_500Medium',
  serifItalic: 'Newsreader_400Regular_Italic',
};
