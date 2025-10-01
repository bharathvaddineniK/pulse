import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';

interface OnboardingSlideProps {
  iconName: keyof typeof Feather.glyphMap;
  title: string;
  description: string;
}

const OnboardingSlide = ({
  iconName,
  title,
  description,
}: OnboardingSlideProps) => {
  return (
    <View style={styles.container}>
      <Feather
        name={iconName}
        size={120}
        color={Colors.textPrimary}
      />
      <Text style={[Typography.h2, styles.title]}>{title}</Text>
      <Text style={[Typography.body, styles.description]}>{description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center', // Revert to this
    padding: 40,
  },
  title: {
    marginTop: 48,
    textAlign: 'center',
  },
  description: {
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
  },
});

export default OnboardingSlide;