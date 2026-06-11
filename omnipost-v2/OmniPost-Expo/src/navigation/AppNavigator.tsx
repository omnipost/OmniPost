// src/navigation/AppNavigator.tsx
import React from 'react';
import { View, Text, TouchableOpacity, useWindowDimensions } from 'react-native';
import { NavigationContainer, CommonActions, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../constants/theme';

// Auth screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen, { OnboardingScreen } from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';

// Main screens
import DashboardScreen  from '../screens/main/DashboardScreen';
import ComposeScreen    from '../screens/main/ComposeScreen';
import CalendarScreen   from '../screens/main/CalendarScreen';
import AnalyticsScreen  from '../screens/main/AnalyticsScreen';
import ProfileScreen    from '../screens/main/ProfileScreen';
import MediaScreen      from '../screens/main/MediaScreen';
import AppHeader        from '../components/AppHeader';

import type { RootStackParamList, MainTabParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab   = createBottomTabNavigator<MainTabParamList>();
const navigationRef = createNavigationContainerRef<any>();


const TAB_ICONS: Record<string, string> = {
  Dashboard: '🏠',
  Compose:   '✏️',
  Calendar:  '📅',
  Analytics: '📊',
  Media:     '🖼️',
  Profile:   '👤',
};

function TabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  // Always show Profile tab on mobile and web
  const showProfile = true;
  const visibleRoutes = state.routes.filter((r: any) => (r.name !== 'Profile') ? true : showProfile);
  // Calculate dynamic tab width based on available container width to prevent overflow
  const tabWidth = (width - 12) / Math.max(1, visibleRoutes.length);

  return (
    <View style={{
      flexDirection: 'row',
      backgroundColor: colors.bg1,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      // Lift the tab bar content on devices with bottom safe area (like iPhone gesture indicator),
      // and provide extra padding on Android devices to clear rounded screen corners.
      paddingBottom: Math.max(insets.bottom, 16) + 8,
      paddingTop: 10,
      paddingHorizontal: 6,
    }}>
      {visibleRoutes.map((route: any, idx: number) => {
        const routeIndex = state.routes.findIndex((r: any) => r.key === route.key);
        const isFocused = state.index === routeIndex;
        const isCompose = route.name === 'Compose';

        function onPress() {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
        }

        const labelFontSize = width < 375 ? 9 : 10;

        if (isCompose) {
          return (
            <TouchableOpacity key={route.key} onPress={onPress} activeOpacity={0.8}
              style={{ width: tabWidth, alignItems: 'center', justifyContent: 'center' }}>
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
              <Text 
                numberOfLines={1}
                adjustsFontSizeToFit
                style={{ fontSize: labelFontSize, color: isFocused ? colors.brand : colors.textMuted, marginTop: 4, fontWeight: '600' }}
              >
                Compose
              </Text>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity key={route.key} onPress={onPress} activeOpacity={0.8}
            style={{ width: tabWidth, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 20, opacity: isFocused ? 1 : 0.5 }}>{TAB_ICONS[route.name]}</Text>
            <Text 
              numberOfLines={1}
              adjustsFontSizeToFit
              style={{ fontSize: labelFontSize, color: isFocused ? colors.brand : colors.textMuted, fontWeight: isFocused ? '700' : '500', marginTop: 4 }}
            >
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
  const [activeTab, setActiveTab] = React.useState('Dashboard');

  return (
    <View style={{ flex: 1 }}>
      {activeTab !== 'Profile' && <AppHeader activeTab={activeTab} />}
      <Tab.Navigator tabBar={props => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
        <Tab.Screen name="Dashboard" component={DashboardScreen} listeners={{ focus: () => setActiveTab('Dashboard') }} />
        <Tab.Screen name="Analytics" component={AnalyticsScreen} listeners={{ focus: () => setActiveTab('Analytics') }} />
        <Tab.Screen name="Compose"   component={ComposeScreen}   listeners={{ focus: () => setActiveTab('Compose') }} />
        <Tab.Screen name="Calendar"  component={CalendarScreen}  listeners={{ focus: () => setActiveTab('Calendar') }} />
        <Tab.Screen name="Media"     component={MediaScreen}     listeners={{ focus: () => setActiveTab('Media') }} />
        <Tab.Screen name="Profile"   component={ProfileScreen}   listeners={{ focus: () => setActiveTab('Profile') }} />
      </Tab.Navigator>
    </View>
  );
}

import SplashScreen from '../screens/auth/SplashScreen';

export default function AppNavigator() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);
  const [showSplash, setShowSplash] = React.useState(true);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const { isDarkMode, toggleTheme, colors } = useTheme();
  const { width } = useWindowDimensions();
  const drawerWidth = Math.min(320, width * 0.75);

  const openScreen = (screen: string) => {
    setDrawerOpen(false);
    if (!navigationRef.isReady()) return;
    navigationRef.dispatch(
      CommonActions.navigate({ name: 'Main', params: { screen } })
    );
  };

  const handleLogout = () => {
    setDrawerOpen(false);
    logout();
  };

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg0 }}>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
          {!isAuthenticated ? (
            <>
              <Stack.Screen name="Login"          component={LoginScreen}          />
              <Stack.Screen name="Register"       component={RegisterScreen}       />
              <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
              <Stack.Screen name="ResetPassword"  component={ResetPasswordScreen}  />
              <Stack.Screen name="Onboarding"     component={OnboardingScreen}     />
            </>
          ) : (
            <Stack.Screen name="Main" component={MainTabs} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}
