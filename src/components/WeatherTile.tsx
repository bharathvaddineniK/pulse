import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  cancelAnimation,
} from 'react-native-reanimated';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';

const weatherInfo: { [key: number]: { icon: keyof typeof Feather.glyphMap } } = {
    0: { icon: 'sun' }, 1: { icon: 'sun' }, 2: { icon: 'cloud' }, 3: { icon: 'cloud' },
    45: { icon: 'align-justify' }, 48: { icon: 'align-justify' },
    51: { icon: 'cloud-drizzle' }, 53: { icon: 'cloud-drizzle' }, 55: { icon: 'cloud-drizzle' },
    61: { icon: 'cloud-rain' }, 63: { icon: 'cloud-rain' }, 65: { icon: 'cloud-rain' },
    71: { icon: 'cloud-snow' }, 73: { icon: 'cloud-snow' }, 75: { icon: 'cloud-snow' },
    80: { icon: 'cloud-drizzle' }, 81: { icon: 'cloud-drizzle' }, 82: { icon: 'cloud-rain' },
    95: { icon: 'cloud-lightning' }, 96: { icon: 'cloud-lightning' }, 99: { icon: 'cloud-lightning' },
};

interface WeatherTileProps {
  weatherData: { temperature: number; weatherCode: number; } | null;
  aqiData: { usAqi: number; } | null;
  isLoading: boolean;
}

const AnimatedFeather = Animated.createAnimatedComponent(Feather);

const WeatherTile = ({ weatherData, aqiData, isLoading }: WeatherTileProps) => {
  const rotation = useSharedValue(0);
  const translationX = useSharedValue(0);

  const iconName = weatherData ? weatherInfo[weatherData.weatherCode]?.icon || 'sun' : 'sun';

  useEffect(() => {
    cancelAnimation(rotation);
    cancelAnimation(translationX);
    if (isLoading) return;

    if (iconName === 'sun') {
      rotation.value = withRepeat(withTiming(360, { duration: 20000 }), -1, false);
    } else {
      rotation.value = 0;
    }

    if (iconName.includes('cloud')) {
        translationX.value = withRepeat(
            withSequence(
                withTiming(5, { duration: 4000 }),
                withTiming(-5, { duration: 4000 })
            ), -1, true );
    } else {
        translationX.value = 0;
    }
  }, [iconName, isLoading]);
  
  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value}deg` },
      { translateX: translationX.value },
    ],
  }));

  const renderContent = () => {
    if (isLoading) {
      return <View style={styles.centered}><ActivityIndicator color={Colors.accentCalm} /></View>;
    }
    if (!weatherData) {
      return <View style={styles.centered}><Text style={styles.errorText}>Weather unavailable</Text></View>;
    }
    
    return (
        <>
            <View style={styles.mainContent}>
                <Text style={styles.temperature}>{Math.round(weatherData.temperature)}°F</Text>
                <AnimatedFeather name={iconName} size={32} color={Colors.textPrimary} style={animatedIconStyle} />
            </View>
            {aqiData && <Text style={styles.subHeader}>AQI {aqiData.usAqi}</Text>}
        </>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Local Sky</Text>
      <View style={styles.contentContainer}>
        {renderContent()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(30, 30, 30, 0.75)',
    borderRadius: 16,
    padding: 20,
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(100, 100, 100, 0.2)',
  },
  title: {
    ...Typography.body,
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainContent: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginTop: 8,
  },
  temperature: {
    fontFamily: 'Inter_700Bold',
    fontSize: 40, 
    color: Colors.textPrimary,
    lineHeight: 48,
  },
  subHeader: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  errorText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  }
});

export default WeatherTile;