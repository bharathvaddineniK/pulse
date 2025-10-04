import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthLoadingScreen from '../screens/AuthLoadingScreen';
import EntryScreen from '../screens/EntryScreen';
import VerificationScreen from '../screens/VerificationScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import HomeScreen from '../screens/HomeScreen';
import LocationPermissionScreen from '../screens/LocationPermissionScreen';
import SettingsScreen from '../screens/SettingsScreen';
import DetailedWeatherScreen from '../screens/DetailedWeatherScreen'; // Keep this screen
import CreatePulseScreen from '../screens/CreatePulseScreen';       // And also add this screen
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';

export type RootStackParamList = {
  AuthLoading: undefined;
  Entry: undefined;
  Verification: undefined;
  Onboarding: undefined;
  Home: undefined;
  LocationPermission: undefined;
  Settings: undefined;
  DetailedWeather: undefined; // Keep this route
  CreatePulse: undefined;       // And also add this route
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="AuthLoading"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.backgroundDark },
          headerStyle: { backgroundColor: Colors.surface },
          headerTitleStyle: { ...Typography.h2 },
          headerTintColor: Colors.textPrimary,
        }}
      >
        <Stack.Screen name="AuthLoading" component={AuthLoadingScreen} />
        <Stack.Screen name="Entry" component={EntryScreen} />
        <Stack.Screen name="Verification" component={VerificationScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            headerShown: true,
            headerStyle: { backgroundColor: Colors.backgroundDark },
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="LocationPermission"
          component={LocationPermissionScreen}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            headerShown: true,
            headerTitle: 'Settings',
          }}
        />
        <Stack.Screen
          name="DetailedWeather"
          component={DetailedWeatherScreen}
          options={{
            headerShown: true,
            headerTitle: 'Weather Details',
          }}
        />
        <Stack.Screen
          name="CreatePulse"
          component={CreatePulseScreen}
          options={{
            headerShown: true,
            headerTitle: 'Create a Pulse',
            presentation: 'modal',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;