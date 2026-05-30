import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Feather } from '@expo/vector-icons';
import { quickSignalsData, QuickSignal } from '../constants/quickSignalsData';

const ANSWER_EXPIRY_MS = 3 * 60 * 60 * 1000;

interface QuickSignalsModalProps {
  visible: boolean;
  onClose: () => void;
  selectedQuestion: QuickSignal;
}

const QuickSignalsModal: React.FC<QuickSignalsModalProps> = ({
  visible,
  onClose,
  selectedQuestion,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  const [activeQuestion, setActiveQuestion] = useState<QuickSignal>(selectedQuestion);
  const [selectedOption, setSelectedOption] = useState('');
  const [expiryInfo, setExpiryInfo] = useState<string | null>(null);
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (visible) {
      setActiveQuestion(selectedQuestion);
      loadSavedAnswer(selectedQuestion.id);
      setIsDropdownOpen(false);

      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 60, useNativeDriver: true }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
    }
  }, [visible]);

  const handleQuestionSelect = (question: QuickSignal) => {
    setActiveQuestion(question);
    loadSavedAnswer(question.id);
    setIsDropdownOpen(false);
  };
  
  const loadSavedAnswer = async (questionId: string) => {
    try {
      const data = await AsyncStorage.getItem(`signal_${questionId}`);
      if (data) {
        const parsed = JSON.parse(data);
        const now = Date.now();
        if (now - parsed.timestamp < ANSWER_EXPIRY_MS) {
          setSelectedOption(parsed.answer);
          const expiryTime = new Date(parsed.timestamp + ANSWER_EXPIRY_MS);
          setExpiryInfo(
            `Your answer “${parsed.answer}” will be visible until ${expiryTime.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}.`
          );
        } else {
          await AsyncStorage.removeItem(`signal_${questionId}`);
          setSelectedOption('');
          setExpiryInfo(null);
        }
      } else {
        setSelectedOption('');
        setExpiryInfo(null);
      }
    } catch (err) {
      console.error('Error loading saved answer:', err);
    }
  };

  const handleAnswerSelect = async (option: string) => {
    setSelectedOption(option);
    const record = {
      id: activeQuestion.id,
      answer: option,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(`signal_${activeQuestion.id}`, JSON.stringify(record));
    const expiryTime = new Date(record.timestamp + ANSWER_EXPIRY_MS);
    setExpiryInfo(
      `Your answer “${option}” will be visible until ${expiryTime.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })}.`
    );
  };

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.backdrop}>
        <Animated.View style={[styles.modalContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {activeQuestion.icon} {activeQuestion.category}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.label}>Select Question</Text>
          {/* This container now provides the positioning context for the list */}
          <View style={styles.dropdownContainer}>
            <TouchableOpacity 
              style={styles.dropdownHeader} 
              onPress={() => setIsDropdownOpen(prev => !prev)}
            >
              <Text style={styles.dropdownHeaderText}>{activeQuestion.icon} {activeQuestion.prompt}</Text>
              <Feather name={isDropdownOpen ? "chevron-up" : "chevron-down"} size={20} color={Colors.textSecondary} />
            </TouchableOpacity>

            {isDropdownOpen && (
              <FlatList
                style={styles.dropdownList} // This style now has absolute positioning
                data={quickSignalsData}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.dropdownItem,
                      item.id === activeQuestion.id && styles.dropdownItemSelected,
                    ]}
                    onPress={() => handleQuestionSelect(item)}
                  >
                    <Text style={[
                      styles.dropdownText,
                      item.id === activeQuestion.id && styles.dropdownTextSelected,
                    ]}>
                      {item.icon} {item.prompt}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>

          <Text style={[styles.label, { marginTop: 16 }]}>Select Answer</Text>
          <View style={styles.answerContainer}>
            {activeQuestion.options.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.dropdownItem,
                  selectedOption === option && styles.dropdownItemSelected,
                ]}
                onPress={() => handleAnswerSelect(option)}
              >
                <View style={styles.radioWrapper}>
                  <View style={[styles.radioCircle, selectedOption === option && styles.radioSelected]} />
                  <Text style={[
                    styles.dropdownText,
                    selectedOption === option && styles.dropdownTextSelected,
                  ]}>
                    {option}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {expiryInfo ? (
            <Text style={styles.expiryInfo}>{expiryInfo}</Text>
          ) : (
            <Text style={styles.infoText}>🕒 Your selected answer will be visible for 3 hours.</Text>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

export default QuickSignalsModal;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerTitle: {
    ...Typography.body,
    fontWeight: '600',
    fontSize: 16,
    color: Colors.textPrimary,
  },
  closeButton: {
    padding: 4,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
  },
  label: {
    ...Typography.metadata,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  // --- STYLE CHANGES ARE HERE ---
  dropdownContainer: {
    // This container is now just for positioning. 
    // It needs a zIndex so the absolute list can appear above the answer section.
    position: 'relative',
    zIndex: 10,
  },
  dropdownHeader: {
    // The header gets the visible styles
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    height: 48, // Give it a fixed height
  },
  dropdownHeaderText: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  dropdownList: {
    // This list now floats on top
    position: 'absolute',
    top: 52, // Position it just below the header (48 height + 4 buffer)
    left: 0,
    right: 0,
    backgroundColor: '#2C2C2E', // A solid background is needed
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    maxHeight: 220, // It's still scrollable
    zIndex: 11, // Ensure it's on top of the header too
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  dropdownItemSelected: {
    backgroundColor: 'rgba(0,255,255,0.1)',
  },
  dropdownText: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontSize: 14,
  },
  dropdownTextSelected: {
    color: Colors.accentCalm,
    fontWeight: '600',
  },
  // --- END OF STYLE CHANGES ---
  answerContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 4,
  },
  radioWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: Colors.textSecondary,
    marginRight: 12,
  },
  radioSelected: {
    backgroundColor: Colors.accentCalm,
    borderColor: Colors.accentCalm,
  },
  infoText: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontSize: 12.5,
    textAlign: 'center',
    marginTop: 18,
  },
  expiryInfo: {
    ...Typography.body,
    color: Colors.accentCalm,
    fontSize: 12.5,
    textAlign: 'center',
    marginTop: 18,
  },
});