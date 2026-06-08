// src/navigation/AppNavigator.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Platform, useWindowDimensions } from 'react-native';
import { NavigationContainer, CommonActions, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '../store/authStore';
import { Colors, useTheme } from '../constants/theme';

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

import type { RootStackParamList, MainTabParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab   = createBottomTabNavigator<MainTabParamList>();
const navigationRef = createNavigationContainerRef<any>();

const MENU_ITEMS = [
  { id: 'Dashboard', label: 'Dashboard', icon: '🏠' },
  { id: 'Compose',   label: 'Compose',   icon: '✏️' },
  { id: 'Calendar',  label: 'Calendar',  icon: '📅' },
  { id: 'Analytics', label: 'Analytics', icon: '📊' },
  { id: 'Media',     label: 'Media',     icon: '🖼️' },
  { id: 'Profile',   label: 'Profile',   icon: '👤' },
];

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
  const { width } = useWindowDimensions();
  const tabWidth = Math.max(64, width / Math.max(1, state.routes.length - 1));

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
        if (route.name === 'Profile') return null;
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
              <Text style={{ fontSize: 10, color: isFocused ? colors.brand : colors.textMuted, marginTop: 4, fontWeight: '600' }}>Compose</Text>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity key={route.key} onPress={onPress} activeOpacity={0.8}
            style={{ width: tabWidth, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 20, opacity: isFocused ? 1 : 0.5 }}>{TAB_ICONS[route.name]}</Text>
            <Text style={{ fontSize: 10, color: isFocused ? colors.brand : colors.textMuted, fontWeight: isFocused ? '700' : '500', marginTop: 4 }}>
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
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarButton: () => null }}
      />
    </Tab.Navigator>
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

      {isAuthenticated && drawerOpen && (
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setDrawerOpen(false)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.35)',
            zIndex: 998,
          }}
        >
          <View
            onStartShouldSetResponder={() => true}
            style={{
              width: drawerWidth,
              maxWidth: 320,
              height: '100%',
              backgroundColor: colors.bg0,
              padding: width < 350 ? 16 : 20,
              borderTopRightRadius: 24,
              borderBottomRightRadius: 24,
              shadowColor: '#000',
              shadowOpacity: 0.16,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 5 },
              elevation: 18,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 18 }}>Menu</Text>
            {MENU_ITEMS.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => openScreen(item.id)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 14,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                }}
              >
                <Text style={{ fontSize: 18 }}>{item.icon}</Text>
                <Text style={{ fontSize: 15, color: colors.text, fontWeight: '600', marginLeft: 12 }}>{item.label}</Text>
              </TouchableOpacity>
            ))}
            <View style={{ marginTop: 24, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 18 }}>
              <TouchableOpacity
                onPress={handleLogout}
                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14 }}
              >
                <Text style={{ fontSize: 18 }}>🚪</Text>
                <Text style={{ fontSize: 15, color: colors.danger, fontWeight: '700', marginLeft: 12 }}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      )}

      {isAuthenticated && (
        <TouchableOpacity
          onPress={() => setDrawerOpen(true)}
          activeOpacity={0.8}
          style={{
            position: 'absolute',
            top: Platform.OS === 'ios' ? 44 : 32,
            left: 16,
            width: 42,
            height: 42,
            borderRadius: 21,
            backgroundColor: isDarkMode ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.08)',
            borderWidth: 1,
            borderColor: isDarkMode ? 'rgba(255,255,255,0.18)' : 'rgba(15,23,42,0.08)',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: isDarkMode ? '#fff' : '#000',
            shadowOpacity: isDarkMode ? 0.45 : 0.18,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 4 },
            elevation: 10,
            zIndex: 99999,
          }}
        >
          <Text style={{ fontSize: 18, color: isDarkMode ? '#fff' : '#111' }}>☰</Text>
        </TouchableOpacity>
      )}

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
