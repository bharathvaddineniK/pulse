import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { quickSignalsData, QuickSignal } from '../constants/quickSignalsData';
import QuickSignalsModal from './QuickSignalsModal';

const ROTATION_INTERVAL = 15000;
const RESPONSE_VALIDITY_HOURS = 3;

const NeighborhoodPulseTile = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userResponse, setUserResponse] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const currentQuestion: QuickSignal = quickSignalsData[currentIndex];

  useEffect(() => {
    const interval = setInterval(() => {
      fadeOutIn(() => {
        setCurrentIndex((prev) => (prev + 1) % quickSignalsData.length);
      });
    }, ROTATION_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const fadeOutIn = (callback?: () => void) => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 250, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 250, easing: Easing.in(Easing.ease), useNativeDriver: true }),
    ]).start(() => callback && callback());
  };

  useEffect(() => {
    const loadResponse = async () => {
      try {
        const stored = await AsyncStorage.getItem(`response_${currentQuestion.id}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          const timeDiff = (Date.now() - parsed.timestamp) / (1000 * 60 * 60);
          if (timeDiff < RESPONSE_VALIDITY_HOURS) setUserResponse(parsed.answer);
          else await AsyncStorage.removeItem(`response_${currentQuestion.id}`);
        } else setUserResponse(null);
      } catch (err) {
        console.error('Error loading response:', err);
      }
    };
    loadResponse();
  }, [currentIndex]);

  const getResponseText = () => {
    if (userResponse) {
      return `_${Math.floor(Math.random() * 60) + 40}% responded ${userResponse.toLowerCase()}_`;
    }
    return '_Be the first to respond_';
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Feather name="activity" size={14} color={Colors.textSecondary} />
          <Text style={styles.headerText}>Neighborhood Pulse</Text>
        </View>

        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <TouchableOpacity activeOpacity={0.8} onPress={() => setModalVisible(true)}>
            <Text style={styles.promptText}>
              {currentQuestion.icon} {currentQuestion.prompt}
            </Text>
          </TouchableOpacity>
          <Text style={styles.responseText}>{getResponseText()}</Text>
        </Animated.View>
      </View>

      <QuickSignalsModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        selectedQuestion={currentQuestion}
      />
    </>
  );
};

export default NeighborhoodPulseTile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(30,30,30,0.75)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginLeft: 6,
    fontSize: 13,
    letterSpacing: 0.2,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  promptText: {
    ...Typography.body,
    fontSize: 15.5,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  responseText: {
    ...Typography.body,
    fontSize: 13,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 2,
    letterSpacing: 0.2,
  },
});
