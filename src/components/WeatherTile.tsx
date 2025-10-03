import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';

const weatherInfo: { [key: number]: { icon: keyof typeof Feather.glyphMap; description: string } } = {
    0: { icon: 'sun', description: 'Clear Sky' },
    1: { icon: 'sun', description: 'Mainly Clear' },
    2: { icon: 'cloud', description: 'Partly Cloudy' },
    3: { icon: 'cloud', description: 'Overcast' },
    45: { icon: 'align-justify', description: 'Fog' },
    48: { icon: 'align-justify', description: 'Rime Fog' },
    51: { icon: 'cloud-drizzle', description: 'Light Drizzle' },
    53: { icon: 'cloud-drizzle', description: 'Drizzle' },
    55: { icon: 'cloud-drizzle', description: 'Dense Drizzle' },
    61: { icon: 'cloud-rain', description: 'Slight Rain' },
    63: { icon: 'cloud-rain', description: 'Rain' },
    65: { icon: 'cloud-rain', description: 'Heavy Rain' },
    71: { icon: 'cloud-snow', description: 'Light Snow' },
    73: { icon: 'cloud-snow', description: 'Snow' },
    75: { icon: 'cloud-snow', description: 'Heavy Snow' },
    80: { icon: 'cloud-drizzle', description: 'Slight Showers' },
    81: { icon: 'cloud-drizzle', description: 'Showers' },
    82: { icon: 'cloud-rain', description: 'Heavy Showers' },
    95: { icon: 'cloud-lightning', description: 'Thunderstorm' },
    96: { icon: 'cloud-lightning', description: 'Thunderstorm' },
    99: { icon: 'cloud-lightning', description: 'Thunderstorm' },
};


interface WeatherTileProps {
  weatherData: {
    temperature: number;
    weatherCode: number;
  } | null;
  isLoading: boolean;
}

const AnimatedFeather = Animated.createAnimatedComponent(Feather);

const WeatherTile = ({ weatherData, isLoading }: WeatherTileProps) => {
  const rotation = useSharedValue(0);
  const translationX = useSharedValue(0);

  const iconName = weatherData ? weatherInfo[weatherData.weatherCode]?.icon || 'sun' : 'sun';

  useEffect(() => {
    if (iconName === 'sun') {
      rotation.value = withRepeat(withTiming(360, { duration: 20000 }), -1, false);
    } else {
      rotation.value = 0; // Reset if not a sun
    }

    if (iconName.includes('cloud')) {
        translationX.value = withRepeat(
            withSequence(
                withTiming(10, { duration: 3000 }),
                withTiming(-10, { duration: 3000 })
            ),
            -1,
            true
        );
    } else {
        translationX.value = 0; // Reset if not a cloud
    }
  }, [iconName]);
  
  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${rotation.value}deg` },
        { translateX: translationX.value },
      ],
    };
  });

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={Colors.accentCalm} />
      </View>
    );
  }

  if (!weatherData) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Weather data unavailable</Text>
      </View>
    );
  }
  
  const description = weatherInfo[weatherData.weatherCode]?.description || 'Clear';

  return (
    <View style={styles.container}>
      <Text style={styles.header}>What's New</Text>
      <View style={styles.weatherContent}>
        <AnimatedFeather name={iconName} size={48} color={Colors.textPrimary} style={animatedIconStyle} />
        <View style={styles.tempContainer}>
          <Text style={styles.temperature}>{Math.round(weatherData.temperature)}°F</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    minHeight: 150,
    justifyContent: 'center',
  },
  header: {
    position: 'absolute',
    top: 20,
    left: 20,
    ...Typography.body,
    color: Colors.textSecondary,
  },
  weatherContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 20,
  },
  tempContainer: {
    alignItems: 'center',
  },
  temperature: {
    ...Typography.h1,
    fontSize: 56,
    color: Colors.accentCalm, // Use accent color for temperature
  },
  description: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: -5, // Nudge it closer to the temperature
  },
  errorText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  }
});

export default WeatherTile;