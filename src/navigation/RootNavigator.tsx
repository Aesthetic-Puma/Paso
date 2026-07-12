import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { useStore } from '../store/useStore';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { RevealScreen } from '../screens/RevealScreen';
import { CountryScreen } from '../screens/CountryScreen';
import { DateScreen } from '../screens/DateScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { TabNavigator } from './TabNavigator';
import { Colors } from '../theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const onboardingDone = useStore((s) => s.onboardingDone);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.bg },
          animation: 'fade_from_bottom',
        }}
      >
        {!onboardingDone ? (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen
              name="Reveal"
              component={RevealScreen}
              options={{ animation: 'fade', gestureEnabled: false }}
            />
          </>
        ) : (
          <Stack.Screen name="Main" component={TabNavigator} />
        )}
        <Stack.Screen
          name="Country"
          component={CountryScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="DatePicker"
          component={DateScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{ animation: 'slide_from_right' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
