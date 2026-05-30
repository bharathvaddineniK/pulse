import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { RootStackParamList } from '../navigation/AppNavigator';

const { width } = Dimensions.get('window');

// --- Prompts ---
const personalPrompts = [
  "What’s your comfort meal tonight?",
  "Need a study buddy nearby?",
  "Invite your friends for a chill evening?",
  "Take five minutes to breathe — you deserve it.",
  "What’s your perfect weekend vibe?",
  "Who would you call for a late-night walk?",
  "Ready to make today feel good?",
  "If your day had a soundtrack, what’s playing?",
  "Let’s plan something spontaneous.",
  "What’s one small thing that made you smile today?",
];

// --- Backgrounds ---
const bgImages = [
  require('../assets/images/bg1.jpg'),
  require('../assets/images/bg2.jpg'),
  require('../assets/images/bg3.jpg'),
  require('../assets/images/bg4.jpg'),
];

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const SpotlightTile = () => {
  const navigation = useNavigation<NavigationProp>();
  const [promptIndex, setPromptIndex] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);

  const panAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  /** --- Gentle back-and-forth pan --- */
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(panAnim, {
          toValue: -20,
          duration: 15000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(panAnim, {
          toValue: 20,
          duration: 15000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  /** --- Smooth transition every 45 seconds --- */
  const cycleContent = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 15,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setPromptIndex(prev => (prev + 1) % personalPrompts.length);
      setImageIndex(prev => (prev + 1) % bgImages.length);
      fadeAnim.setValue(0);
      slideAnim.setValue(-15);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 1200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  useEffect(() => {
    const interval = setInterval(cycleContent, 45000);
    return () => clearInterval(interval);
  }, []);

  const handlePress = () => {
    const prefillText = personalPrompts[promptIndex];
    navigation.navigate('CreatePulse', { prefill: prefillText });
  };

  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.9} onPress={handlePress}>
      {/* Animated background */}
      <Animated.View
        style={[
          styles.imageWrapper,
          {
            transform: [{ translateX: panAnim }],
            opacity: fadeAnim,
          },
        ]}
      >
        <ImageBackground
          source={bgImages[imageIndex]}
          style={styles.imageBg}
          resizeMode="cover"
        />
      </Animated.View>

      {/* Overlay gradient */}
      <LinearGradient
        colors={['rgba(0,0,0,0.25)', 'rgba(0,0,0,0.7)']}
        style={styles.overlay}
      >
        <Animated.Text
          style={[
            styles.promptText,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {personalPrompts[promptIndex]}
        </Animated.Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  imageWrapper: {
    ...StyleSheet.absoluteFillObject,
  },
  imageBg: {
    width: width * 1.3,
    height: '110%',
    alignSelf: 'center',
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
  },
  promptText: {
    ...Typography.h2,
    fontSize: 18,
    fontWeight: '500',
    color: '#EAEAEA',
    lineHeight: 26,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default SpotlightTile;
