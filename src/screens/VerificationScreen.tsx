import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  AppState,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { auth, db } from '../config/FirebaseConfig';
import firestore from '@react-native-firebase/firestore';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import Button from '../components/Button';
import PhoneInput, { PhoneInputRef } from '../components/PhoneInput';
import OtpInput from '../components/OtpInput';
import TextLink from '../components/TextLink';

const generateUniqueUsername = async (): Promise<string> => {
  while (true) {
    const randomName: string = uniqueNamesGenerator({
      dictionaries: [adjectives, animals],
      separator: '',
      style: 'capital',
    });
    // Use the new API for querying Firestore
    const usersQuery = await db.collection('users').where('username', '==', randomName).get();
    if (usersQuery.empty) {
      return randomName;
    }
  }
};

type VerificationScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Verification'>;
interface VerificationScreenProps { navigation: VerificationScreenNavigationProp; }

const VerificationScreen = ({ navigation }: VerificationScreenProps) => {
  const [value, setValue] = useState('');
  const [formattedValue, setFormattedValue] = useState('');
  const phoneInputRef = useRef<PhoneInputRef>(null);
  const [isCodeInputVisible, setIsCodeInputVisible] = useState(false);
  const [countdown, setCountdown] = useState(59);
  const [isLoading, setIsLoading] = useState(false);
  // Use the ConfirmationResult type from the new library
  const [confirmation, setConfirmation] = useState<FirebaseAuthTypes.ConfirmationResult | null>(null);

  // ... (useEffect for timer remains the same)
  const appState = useRef(AppState.currentState);
  const timeInBackground = useRef(0);
  useEffect(() => { /* ... timer logic ... */ }, [isCodeInputVisible, countdown]);

  const handleSendCode = async () => {
    if (!phoneInputRef.current?.isValid()) {
      return Alert.alert('Invalid Number', 'Please enter a valid phone number.');
    }
    setIsLoading(true);
    try {
      // Use the new API: auth.signInWithPhoneNumber() - no verifier needed for native
      const confirmationResult = await auth.signInWithPhoneNumber(formattedValue);
      setConfirmation(confirmationResult);
      setCountdown(59);
      setIsCodeInputVisible(true);
    } catch (error: any) {
      Alert.alert('Firebase Error', `Something went wrong: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = () => { handleSendCode(); };

  const handleVerifyCode = async (code: string) => {
    if (!confirmation) return;
    setIsLoading(true);
    try {
      const userCredential = await confirmation.confirm(code);
      if (userCredential && userCredential.additionalUserInfo?.isNewUser) {
        const username = await generateUniqueUsername();
        // Use the new API for setting a document
        await db.collection('users').doc(userCredential.user.uid).set({
          uid: userCredential.user.uid,
          phoneNumber: userCredential.user.phoneNumber,
          username: username,
          createdAt: firestore.Timestamp.now(), // Use new API for Timestamp
          onboardingComplete: false,
        });
        navigation.navigate('Onboarding');
      } else {
        navigation.navigate('Home');
      }
    } catch (error: any) {
      Alert.alert('Error', 'Incorrect code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ... (render functions and styles remain the same)
  const maskPhoneNumber = (num: string) => {
    if (num.length < 8) return num;
    return `${num.substring(0, 4)} (•••) •••-${num.substring(num.length - 4)}`;
  };
  const renderPhoneInputView = () => (
    <>
      <View>
        <Text style={Typography.h1}>Enter your phone number</Text>
        <Text style={[Typography.body, styles.subtext]}>A 6-digit code will be sent via SMS to verify you're a real person.</Text>
      </View>
      <View style={styles.inputContainer}>
        <PhoneInput ref={phoneInputRef} value={value} onChangeText={setValue} onChangeFormattedText={setFormattedValue} />
        <Text style={[Typography.metadata, styles.reassuranceText]}>Your phone number is for verification only and will never be shown to other users.</Text>
      </View>
      <Button title="Send Code" onPress={handleSendCode} />
    </>
  );
  const renderCodeInputView = () => (
    <>
      <View>
        <Text style={Typography.h1}>Enter the 6-digit code</Text>
        <Text style={[Typography.body, styles.subtext]}>Sent to {maskPhoneNumber(formattedValue)}</Text>
      </View>
      <View style={styles.inputContainer}>
        <OtpInput onComplete={handleVerifyCode} />
        <View style={styles.linksContainer}>
          <TextLink label="Change Number" style={styles.link} onPress={() => setIsCodeInputVisible(false)} />
          <TextLink label={countdown > 0 ? `Resend code in ${countdown}s` : 'Resend Code'} style={countdown > 0 ? [styles.link, styles.resendLink] : styles.link} onPress={countdown > 0 ? () => {} : handleResendCode} />
        </View>
      </View>
      <View style={{ height: 60 }} />
    </>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.container}>
          {isCodeInputVisible ? renderCodeInputView() : renderPhoneInputView()}
        </View>
      </TouchableWithoutFeedback>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.accentCalm} />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.backgroundDark },
  container: { flex: 1, paddingHorizontal: 20, paddingVertical: 40, justifyContent: 'space-between' },
  subtext: { color: Colors.textSecondary, marginTop: 8 },
  inputContainer: {},
  reassuranceText: { textAlign: 'center', marginTop: 12 },
  linksContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 },
  link: { ...Typography.body, color: Colors.accentCalm, textDecorationLine: 'underline' },
  resendLink: { color: Colors.textSecondary, textDecorationLine: 'none' },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
});

export default VerificationScreen;