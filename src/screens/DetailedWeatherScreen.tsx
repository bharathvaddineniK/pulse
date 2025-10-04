import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Feather } from '@expo/vector-icons';

const DetailedWeatherScreen = () => {
  // This is a placeholder for now.
  // In a future step, we would pass navigation props
  // to fetch and display detailed forecast data.
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Feather name="cloud-drizzle" size={64} color={Colors.textSecondary} />
        <Text style={[Typography.h2, styles.title]}>Detailed Forecast</Text>
        <Text style={[Typography.body, {color: Colors.textSecondary}]}>
          Hourly and 7-day forecast data will be displayed here.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundDark,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    marginTop: 24,
    marginBottom: 8,
  }
});

export default DetailedWeatherScreen;