import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import { useStore } from '../store/useStore';
import { TabParamList } from './types';
import { HomeScreen } from '../screens/HomeScreen';
import { MapScreen } from '../screens/MapScreen';
import { PlansScreen } from '../screens/PlansScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { Colors, Fonts } from '../theme';

const Tab = createBottomTabNavigator<TabParamList>();

function HomeIcon({ color }: { color: string }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: 22, height: 22 }}>
      <Text style={{ fontSize: 20, color }}>⌂</Text>
    </View>
  );
}

function MapIcon({ color }: { color: string }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: 22, height: 22 }}>
      <Text style={{ fontSize: 18, color }}>🗺</Text>
    </View>
  );
}

function PlanIcon({ color }: { color: string }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: 22, height: 22 }}>
      <Text style={{ fontSize: 18, color }}>✓</Text>
    </View>
  );
}

function ProfileIcon({ color }: { color: string }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: 22, height: 22 }}>
      <Text style={{ fontSize: 18, color }}>◉</Text>
    </View>
  );
}

// Maps French label → internal route name
const TAB_NAME_MAP: Record<string, keyof TabParamList> = {
  Accueil: 'Home',
  Carte: 'Map',
  Plan: 'Plans',
  Profil: 'Profile',
};

export function TabNavigator() {
  const pendingInitialTab = useStore((s) => s.pendingInitialTab);
  const clearPendingInitialTab = useStore((s) => s.clearPendingInitialTab);

  const initialRouteName: keyof TabParamList =
    pendingInitialTab !== null
      ? (TAB_NAME_MAP[pendingInitialTab] ?? 'Home')
      : 'Home';

  useEffect(() => {
    if (pendingInitialTab !== null) clearPendingInitialTab();
  }, []);

  return (
    <Tab.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.tabBg,
          borderTopColor: Colors.tabBorder,
          borderTopWidth: 1,
          paddingBottom: 20,
          paddingTop: 9,
          height: 70,
        },
        tabBarActiveTintColor: Colors.dark,
        tabBarInactiveTintColor: Colors.muted,
        tabBarLabelStyle: {
          fontFamily: Fonts.sansSemiBold,
          fontSize: 10.5,
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Accueil',
          tabBarIcon: ({ color }) => <HomeIcon color={color} />,
        }}
      />
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          tabBarLabel: 'Carte',
          tabBarIcon: ({ color }) => <MapIcon color={color} />,
        }}
      />
      <Tab.Screen
        name="Plans"
        component={PlansScreen}
        options={{
          tabBarLabel: 'Plan',
          tabBarIcon: ({ color }) => <PlanIcon color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profil',
          tabBarIcon: ({ color }) => <ProfileIcon color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}
