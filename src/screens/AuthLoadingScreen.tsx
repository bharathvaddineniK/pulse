import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { auth, db } from '../config/FirebaseConfig';

import { Colors } from '../constants/Colors';

type AuthLoadingScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AuthLoading'
>;

interface AuthLoadingScreenProps {
  navigation: AuthLoadingScreenNavigationProp;
}

const AuthLoadingScreen = ({ navigation }: AuthLoadingScreenProps) => {
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async user => {
      if (user) {
        const userDocRef = db.collection('users').doc(user.uid);
        const docSnap = await userDocRef.get();

        if (docSnap.exists) {
          const userData = docSnap.data();
          // Log the entire user profile fetched from Firestore
          console.log('AuthLoadingScreen: Fetched user profile:', userData);

          if (userData?.onboardingComplete) {
            navigation.replace('Home');
          } else {
            navigation.replace('Onboarding');
          }
        } else {
          // This case handles if a user exists in Auth but not Firestore
          // We'll treat them as a new user who needs to onboard
          navigation.replace('Onboarding');
        }
      } else {
        navigation.replace('Entry');
      }
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.accentCalm} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AuthLoadingScreen;