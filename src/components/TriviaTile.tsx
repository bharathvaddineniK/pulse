import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';

const TriviaTile = () => {
  const [answered, setAnswered] = useState<string | null>(null);
  const correctAnswer = 'Tea Gardens';

  const handleAnswer = (answer: string) => {
    setAnswered(answer);
  };

  const getButtonStyle = (answer: string) => {
    if (!answered) {
      return styles.button;
    }
    if (answer === correctAnswer) {
      return [styles.button, styles.correctButton];
    }
    if (answer === answered) {
      return [styles.button, styles.incorrectButton];
    }
    return [styles.button, { opacity: 0.5 }]; // Fade out the non-selected, incorrect answer
  };
  
  const getButtonTextStyle = (answer: string) => {
      if (answered && answer === correctAnswer) {
          return styles.buttonTextSelected;
      }
      if (answered && answer !== correctAnswer) {
          return styles.buttonText;
      }
      return styles.buttonText;
  }

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>Local Trivia</Text>
        <Text style={styles.bodyText}>Munnar is most famous for its...?</Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={getButtonStyle('Tea Gardens')}
          onPress={() => handleAnswer('Tea Gardens')}
          disabled={!!answered}
        >
          <Text style={getButtonTextStyle('Tea Gardens')}>Tea Gardens</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={getButtonStyle('Skyscrapers')}
          onPress={() => handleAnswer('Skyscrapers')}
          disabled={!!answered}
        >
          <Text style={getButtonTextStyle('Skyscrapers')}>Skyscrapers</Text>
        </TouchableOpacity>
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
    justifyContent: 'space-between', // This is key to layout
  },
  title: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  bodyText: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '500',
    fontSize: 18, // Adjusted for readability
    lineHeight: 22, // Adjusted for readability
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    ...Typography.body,
    fontSize: 14,
    fontWeight: '600',
  },
  buttonTextSelected: {
    ...Typography.body,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.backgroundDark,
  },
  correctButton: {
    backgroundColor: Colors.accentCalm,
  },
  incorrectButton: {
    backgroundColor: Colors.accentUrgent,
  },
});

export default TriviaTile;