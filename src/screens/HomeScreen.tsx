import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { auth, db } from '../config/FirebaseConfig';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Feather } from '@expo/vector-icons';
import LocationPickerModal, { LocationData } from '../components/LocationPickerModal';

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

interface UserData {
  username?: string;
  location?: LocationData;
}

// CORRECTED: A much more robust function to shorten the address
const truncateAddress = (address: string | undefined): string => {
    if (!address) return 'Set Location';
    const firstCommaIndex = address.indexOf(',');
    if (firstCommaIndex !== -1) {
        return address.substring(0, firstCommaIndex); // Return only the part before the first comma
    }
    return address; // If no comma, it's likely already short
};

const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = db.collection('users').doc(user.uid);
        const unsubscribe = userDocRef.onSnapshot(docSnap => {
          if (docSnap.exists) {
            setUserData(docSnap.data() as UserData);
          }
        });
        return () => unsubscribe();
      }
    };
    fetchUserData();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <TouchableOpacity 
          style={styles.locationBar}
          onPress={() => setIsModalVisible(true)}
        >
          <Feather name="map-pin" size={16} color={Colors.accentCalm} />
          <Text style={styles.locationText} numberOfLines={1} ellipsizeMode='tail'>
            {truncateAddress(userData?.location?.address)}
          </Text>
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity 
            onPress={() => navigation.navigate('Settings')}
            style={styles.settingsButton}
        >
          <Feather name="settings" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      ),
      headerTitleAlign: 'left',
      headerLeft: () => null, 
    });
  }, [navigation, userData]);
  
  const handleLocationSelect = async (location: LocationData) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = db.collection('users').doc(user.uid);
        await userDocRef.update({ location: location });
      }
    } catch (error) {
      Alert.alert('Error', 'Could not save location. Please try again.');
    } finally {
      setIsModalVisible(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={Typography.h1}>Bento Grid Placeholder</Text>
        <Text style={styles.placeholderText}>The main grid content will go here.</Text>
      </ScrollView>

      <View style={styles.tabBar}>
        <Feather name="grid" size={28} color={Colors.accentCalm} />
        <Feather name="map" size={28} color={Colors.textSecondary} />
        <Feather name="activity" size={28} color={Colors.textSecondary} />
      </View>

      <LocationPickerModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onLocationSelect={handleLocationSelect}
        showSaveButton={true}
        showPreciseLocation={true}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundDark,
  },
  locationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    paddingRight: 10,
  },
  locationText: {
    ...Typography.body,
    color: Colors.accentCalm,
    marginLeft: 8,
  },
  settingsButton: {
    paddingLeft: 16,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  placeholderText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 20,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 15,
    paddingBottom: 25,
    backgroundColor: Colors.surface,
  },
});

export default HomeScreen;