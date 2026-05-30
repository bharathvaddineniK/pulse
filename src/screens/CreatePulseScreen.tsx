import React, { useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Feather } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';

type CreatePulseRouteProp = RouteProp<RootStackParamList, 'CreatePulse'>;

const CreatePulseScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<CreatePulseRouteProp>();
  const prefill = route.params?.prefill ?? '';

  const [text, setText] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Create Pulse',
      headerStyle: { backgroundColor: Colors.backgroundDark },
      headerTintColor: Colors.textPrimary,
    });
  }, [navigation]);

  const handleSubmit = () => {
    const content = text.trim() || prefill;
    if (!content) return;
    console.log('Pulse created:', content);
    Keyboard.dismiss();
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 🧠 Wrap the entire area with TouchableWithoutFeedback */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView
          style={styles.content}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.header}>
            <Feather name="edit" size={48} color={Colors.accentCalm} />
            <Text style={[Typography.h2, styles.title]}>Create a Pulse</Text>
            <Text
              style={[
                Typography.metadata,
                { color: Colors.textSecondary, textAlign: 'center' },
              ]}
            >
              Share your thoughts, ideas, or neighborhood moments.
            </Text>
          </View>

          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder={prefill || 'What’s on your mind?'}
            placeholderTextColor={Colors.textSecondary}
            multiline
            returnKeyType="done"
            blurOnSubmit
          />

          <TouchableOpacity
            style={[styles.button, { opacity: text.trim() || prefill ? 1 : 0.5 }]}
            disabled={!text.trim() && !prefill}
            onPress={handleSubmit}
          >
            <Text style={styles.buttonText}>Post Pulse</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
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
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    minHeight: 150,
    color: Colors.textPrimary,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 20,
  },
  button: {
    backgroundColor: Colors.accentCalm,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    ...Typography.button,
    color: Colors.backgroundDark,
    fontWeight: '600',
  },
});

export default CreatePulseScreen;
