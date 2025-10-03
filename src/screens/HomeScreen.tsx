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
import WeatherTile from '../components/WeatherTile'; // Import the new component

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

interface WeatherData {
    temperature: number;
    weatherCode: number;
}

const truncateAddress = (address: string | undefined): string => {
    if (!address) return 'Set Location';
    const firstCommaIndex = address.indexOf(',');
    if (firstCommaIndex !== -1) {
        return address.substring(0, firstCommaIndex);
    }
    return address;
};

const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState(true);

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

  // Effect to fetch weather when user location is available or changes
  useEffect(() => {
    const fetchWeather = async () => {
      if (userData?.location) {
        setIsWeatherLoading(true);
        const { latitude, longitude } = userData.location;
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&temperature_unit=fahrenheit`;
        try {
          const response = await fetch(url);
          const data = await response.json();
          if (data.current_weather) {
            setWeatherData({
              temperature: data.current_weather.temperature,
              weatherCode: data.current_weather.weathercode,
            });
          }
        } catch (error) {
          console.error("Failed to fetch weather:", error);
          setWeatherData(null); // Clear data on error
        } finally {
          setIsWeatherLoading(false);
        }
      }
    };

    fetchWeather();
  }, [userData?.location]);


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
        {/* Replace the placeholder with the new WeatherTile */}
        <WeatherTile weatherData={weatherData} isLoading={isWeatherLoading} />
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
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 15,
    paddingBottom: 25,
    backgroundColor: Colors.surface,
  },
});

export default HomeScreen;