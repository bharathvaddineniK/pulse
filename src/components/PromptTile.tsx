import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  Platform,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Feather } from '@expo/vector-icons';

export const prompts = [
  "Describe the vibe of your neighborhood.",
  "What's one sound you always hear in your area?",
  "Share a local tip only a resident would know.",
  "What's the neighborhood's best-kept secret?",
  "Ask a question to your neighbors.",
];

const PromptTile = () => {
  const [currentPrompt, setCurrentPrompt] = useState(
    prompts[Math.floor(Math.random() * prompts.length)]
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [pulseText, setPulseText] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const positionAnim = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);

  /** --- Rotate prompts every 60s --- */
  useEffect(() => {
    const interval = setInterval(() => {
      let newPrompt = currentPrompt;
      while (newPrompt === currentPrompt) {
        newPrompt = prompts[Math.floor(Math.random() * prompts.length)];
      }
      setCurrentPrompt(newPrompt);
    }, 60000);
    return () => clearInterval(interval);
  }, [currentPrompt]);

  /** --- Handle keyboard events --- */
  useEffect(() => {
    const keyboardShow = Keyboard.addListener('keyboardDidShow', () => {
      Animated.spring(positionAnim, {
        toValue: -80,
        damping: 18,
        stiffness: 180,
        useNativeDriver: true,
      }).start();
    });

    const keyboardHide = Keyboard.addListener('keyboardDidHide', () => {
      Animated.spring(positionAnim, {
        toValue: 0,
        damping: 18,
        stiffness: 180,
        useNativeDriver: true,
      }).start();
    });

    return () => {
      keyboardShow.remove();
      keyboardHide.remove();
    };
  }, []);

  /** --- Open Modal --- */
  const openModal = () => {
    setModalVisible(true);
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        damping: 20,
        stiffness: 160,
        mass: 0.8,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();

    // Focus input after animation
    setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
  };

  /** --- Close Modal --- */
  const closeModal = () => {
    Keyboard.dismiss();
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 40,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalVisible(false);
      setPulseText('');
    });
  };

  /** --- Handle Post --- */
  const handlePost = () => {
    if (pulseText.trim()) {
      console.log('Posted:', pulseText);
      setPulseText('');
      closeModal();
    }
  };

  return (
    <>
      {/* --- Tile --- */}
      <TouchableOpacity style={styles.container} onPress={openModal}>
        <View style={styles.headerContainer}>
          <Feather name="message-square" size={16} color={Colors.textSecondary} />
          <Text style={styles.header}>Post a quick pulse</Text>
        </View>
        <Text style={styles.bodyText}>{currentPrompt}</Text>
      </TouchableOpacity>

      {/* --- Modal --- */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={closeModal}
      >
        <View style={styles.modalWrapper}>
          {/* Background */}
          <TouchableWithoutFeedback onPress={closeModal}>
            <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
          </TouchableWithoutFeedback>

          {/* Content */}
          <Animated.View
  style={[
    styles.modalContainer,
    {
      opacity: fadeAnim,
      transform: [{ translateY: slideAnim }, { translateY: positionAnim }],
    },
  ]}
>
  {/* Close Button */}
  <TouchableOpacity
    onPress={closeModal}
    style={styles.closeButton}
    activeOpacity={0.7}
  >
    <Feather name="x" size={20} color={Colors.textSecondary} />
  </TouchableOpacity>

  {/* Prompt Text */}
  <Text style={styles.modalPrompt}>{currentPrompt}</Text>

  <TextInput
    ref={inputRef}
    style={styles.textInput}
    placeholder="Write your Pulse..."
    placeholderTextColor={Colors.textSecondary}
    multiline
    value={pulseText}
    onChangeText={setPulseText}
    returnKeyType="done"
    blurOnSubmit
  />

  <Text style={styles.lifespanText}>⏳ This Pulse lives for 24 hours.</Text>

  <View style={styles.buttonRow}>
    <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
      <Text style={styles.cancelText}>Cancel</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.postButton} onPress={handlePost}>
      <Text style={styles.postText}>Post</Text>
    </TouchableOpacity>
  </View>
</Animated.View>

        </View>
      </Modal>
    </>
  );
};

/** --- Styles --- */
const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(30, 30, 30, 0.75)',
    borderRadius: 16,
    padding: 20,
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(100, 100, 100, 0.2)',
    justifyContent: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  header: {
    ...Typography.body,
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 6,
    fontWeight: '500',
  },
  bodyText: {
    ...Typography.body,
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  modalWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContainer: {
  alignSelf: 'center',
  width: '88%',
  backgroundColor: Colors.surface,
  borderRadius: 20,
  paddingHorizontal: 24,
  paddingTop: 40, // added space for the close button
  paddingBottom: 24,
  minHeight: 260,
  position: 'relative',
},
closeButton: {
  position: 'absolute',
  top: 12,
  right: 12,
  zIndex: 20,
  backgroundColor: 'rgba(255,255,255,0.06)',
  borderRadius: 20,
  padding: 5,
},
modalPrompt: {
  ...Typography.h2,
  fontSize: 18,
  marginBottom: 14,
  color: Colors.textPrimary,
  fontWeight: '600',
  paddingRight: 30, // ensures text doesn’t overlap the X
},
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    color: Colors.textPrimary,
    padding: 12,
    fontSize: 15,
    textAlignVertical: 'top',
    height: 100,
    marginBottom: 10,
  },
  lifespanText: {
    ...Typography.metadata,
    color: Colors.textSecondary,
    marginBottom: 18,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 10,
  },
  cancelText: {
    ...Typography.button,
    color: Colors.textSecondary,
  },
  postButton: {
    backgroundColor: Colors.accentCalm,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  postText: {
    ...Typography.button,
    fontWeight: '600',
  },
});

export default PromptTile;
