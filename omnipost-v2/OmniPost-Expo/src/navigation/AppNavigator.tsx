// src/navigation/AppNavigator.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '../store/authStore';
import { Colors, useTheme } from '../constants/theme';

// Auth screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen, { OnboardingScreen } from '../screens/auth/RegisterScreen';

// Main screens
import DashboardScreen  from '../screens/main/DashboardScreen';
import ComposeScreen    from '../screens/main/ComposeScreen';
import CalendarScreen   from '../screens/main/CalendarScreen';
import AnalyticsScreen  from '../screens/main/AnalyticsScreen';
import ProfileScreen    from '../screens/main/ProfileScreen';
import MediaScreen      from '../screens/main/MediaScreen';

import type { RootStackParamList, MainTabParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab   = createBottomTabNavigator<MainTabParamList>();

const TAB_ICONS: Record<string, string> = {
  Dashboard: '🏠',
  Compose:   '✏️',
  Calendar:  '📅',
  Analytics: '📊',
  Media:     '🖼️',
  Profile:   '👤',
};

function TabBar({ state, descriptors, navigation }: any) {
  const { colors } = useTheme();
  return (
    <View style={{
      flexDirection: 'row',
      backgroundColor: colors.bg1,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingBottom: Platform.OS === 'ios' ? 24 : 8,
      paddingTop: 8,
      paddingHorizontal: 8,
    }}>
      {state.routes.map((route: any, index: number) => {
        const { options }   = descriptors[route.key];
        const isFocused     = state.index === index;
        const isCompose     = route.name === 'Compose';

        function onPress() {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
        }

        if (isCompose) {
          return (
            <TouchableOpacity key={route.key} onPress={onPress} activeOpacity={0.8}
              style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <View style={{
                width: 50, height: 50, borderRadius: 25,
                backgroundColor: colors.brand,
                alignItems: 'center', justifyContent: 'center',
                marginTop: -20,
                shadowColor: colors.brand, shadowOpacity: 0.5, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
                elevation: 8,
              }}>
                <Text style={{ fontSize: 22 }}>✏️</Text>
              </View>
              <Text style={{ fontSize: 10, color: isFocused ? colors.brand : colors.textMuted, marginTop: 4, fontWeight: '600' }}>Compose</Text>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity key={route.key} onPress={onPress} activeOpacity={0.8}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3 }}>
            <Text style={{ fontSize: 20, opacity: isFocused ? 1 : 0.5 }}>{TAB_ICONS[route.name]}</Text>
            <Text style={{ fontSize: 10, color: isFocused ? colors.brand : colors.textMuted, fontWeight: isFocused ? '700' : '500' }}>
              {route.name}
            </Text>
            {isFocused && (
              <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: colors.brand, position: 'absolute', bottom: -2 }} />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator tabBar={props => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} />
      <Tab.Screen name="Compose"   component={ComposeScreen}   />
      <Tab.Screen name="Calendar"  component={CalendarScreen}  />
      <Tab.Screen name="Media"     component={MediaScreen}     />
      <Tab.Screen name="Profile"   component={ProfileScreen}   />
    </Tab.Navigator>
  );
}

import SplashScreen from '../screens/auth/SplashScreen';

export default function AppNavigator() {
  const { isAuthenticated } = useAuthStore();
  const [showSplash, setShowSplash] = React.useState(true);
  const { isDarkMode, toggleTheme, colors } = useTheme();

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg0 }}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
          {!isAuthenticated ? (
            <>
              <Stack.Screen name="Login"      component={LoginScreen}      />
              <Stack.Screen name="Register"   component={RegisterScreen}   />
              <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            </>
          ) : (
            <Stack.Screen name="Main" component={MainTabs} />
          )}
        </Stack.Navigator>
      </NavigationContainer>

      {/* Floating Theme Toggle Icon at top right */}
      <TouchableOpacity
        onPress={toggleTheme}
        activeOpacity={0.7}
        style={{
          position: 'absolute',
          top: Platform.OS === 'ios' ? 44 : 32,
          right: 16,
          width: 38,
          height: 38,
          borderRadius: 19,
          backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.06)',
          borderWidth: 1,
          borderColor: isDarkMode ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.08)',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
        }}
      >
        <Text style={{ fontSize: 16 }}>{isDarkMode ? '☀️' : '🌙'}</Text>
      </TouchableOpacity>
    </View>
  );
}
