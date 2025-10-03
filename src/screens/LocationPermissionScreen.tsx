import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { auth, db } from '../config/FirebaseConfig';
import * as Location from 'expo-location';
import { GOOGLE_MAPS_API_KEY } from '@env';

import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import Button from '../components/Button';
import TextLink from '../components/TextLink';
import LocationPickerModal, {
  LocationData,
} from '../components/LocationPickerModal';

type LocationPermissionScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'LocationPermission'
>;

interface LocationPermissionScreenProps {
  navigation: LocationPermissionScreenNavigationProp;
}

const LocationPermissionScreen = ({
  navigation,
}: LocationPermissionScreenProps) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigateHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  const handleLocationSelect = async (location: LocationData) => {
    setIsLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = db.collection('users').doc(user.uid);
        await userDocRef.update({ location: location });
        navigateHome(); // Use the reset function
      }
    } catch (error) {
      Alert.alert('Error', 'Could not save location. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreciseLocation = async () => {
    setIsLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Pulse needs location access to show you what\'s happening nearby. You can enable it in your device settings.'
        );
        setIsLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`;
      const response = await fetch(url);
      const json = await response.json();

      if (json.status === 'OK' && json.results.length > 0) {
        const address = json.results[0].formatted_address;
        await handleLocationSelect({ address, latitude, longitude });
      } else {
        throw new Error('Could not determine address.');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not get location. Please try again or set it manually.');
      setIsLoading(false);
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Feather name="map-pin" size={80} color={Colors.textPrimary} />
        <Text style={[Typography.h1, styles.title]}>
          Pulse is All About Location
        </Text>
        <Text style={[Typography.body, styles.description]}>
          To show you what's happening nearby, please choose how you'd like to
          share your location.
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button title="Use Precise Location" onPress={handlePreciseLocation} />
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => setIsModalVisible(true)}>
          <Text style={Typography.body}>Set My Neighborhood Manually</Text>
        </TouchableOpacity>
        <TextLink
          label="Maybe Later"
          style={styles.tertiaryLink}
          onPress={navigateHome} // Use the reset function
        />
      </View>

      <LocationPickerModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onLocationSelect={handleLocationSelect}
        showSaveButton={false}
      />

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.accentCalm} />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundDark,
    justifyContent: 'space-between',
    padding: 20,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  title: {
    textAlign: 'center',
    marginTop: 24,
  },
  description: {
    textAlign: 'center',
    color: Colors.textSecondary,
    marginTop: 12,
  },
  buttonContainer: {
    // This container holds the three options
  },
  secondaryButton: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  tertiaryLink: {
    ...Typography.body,
    color: Colors.textSecondary,
    textDecorationLine: 'underline',
    textAlign: 'center',
    marginTop: 16,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LocationPermissionScreen;