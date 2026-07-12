import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Colors, Fonts } from '../theme';
import { PasoLogo } from '../components/PasoLogo';
import { Mascot } from '../components/Mascot';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Welcome'>;
};

export function WelcomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />
      <View style={styles.container}>
        <PasoLogo size="lg" />

        <View style={styles.mascotWrapper}>
          <Mascot posture="salut" size={220} />
        </View>

        <View style={styles.bottom}>
          <Text style={styles.headline}>Ton compagnon pour réussir ton expatriation</Text>
          <View style={styles.chips}>
            <Text style={styles.chip}>Visa</Text>
            <View style={styles.dot} />
            <Text style={styles.chip}>Budget</Text>
            <View style={styles.dot} />
            <Text style={styles.chip}>Démarches</Text>
          </View>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.navigate('Onboarding')}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>Commencer</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.ghostBtn}
            onPress={() => navigation.navigate('Onboarding')}
            activeOpacity={0.7}
          >
            <Text style={styles.ghostBtnText}>J'ai déjà un compte</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: 48,
    paddingBottom: 34,
  },
  mascotWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottom: {
    width: '100%',
    alignItems: 'center',
  },
  headline: {
    fontFamily: Fonts.serifMedium,
    fontSize: 30,
    lineHeight: 34,
    letterSpacing: -0.5,
    color: Colors.dark,
    textAlign: 'center',
  },
  chips: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
  },
  chip: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 14,
    color: '#6F6A60',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#c9bfa8',
  },
  primaryBtn: {
    width: '100%',
    backgroundColor: Colors.dark,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 30,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 8,
  },
  primaryBtnText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 16.5,
    color: Colors.bg,
  },
  ghostBtn: {
    marginTop: 14,
    paddingVertical: 6,
  },
  ghostBtnText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 14,
    color: '#6F6A60',
  },
});
