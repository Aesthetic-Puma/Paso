import React from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  HankenGrotesk_400Regular,
  HankenGrotesk_500Medium,
  HankenGrotesk_600SemiBold,
  HankenGrotesk_700Bold,
} from '@expo-google-fonts/hanken-grotesk';
import {
  Newsreader_400Regular,
  Newsreader_500Medium,
} from '@expo-google-fonts/newsreader';
import { View, ActivityIndicator } from 'react-native';
import { RootNavigator } from './src/navigation/RootNavigator';
import { Colors } from './src/theme';
import { useStore } from './src/store/useStore';

export default function App() {
  const [fontsLoaded] = useFonts({
    HankenGrotesk_400Regular,
    HankenGrotesk_500Medium,
    HankenGrotesk_600SemiBold,
    HankenGrotesk_700Bold,
    Newsreader_400Regular,
    Newsreader_500Medium,
  });

  const hydrated = useStore((s) => s._hasHydrated);

  if (!fontsLoaded || !hydrated) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.bg }}>
        <ActivityIndicator color={Colors.dark} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" backgroundColor={Colors.bg} />
      <RootNavigator />
    </>
  );
}
