import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Alert, Dimensions } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { GOOGLE_MAPS_API_KEY, UNSPLASH_ACCESS_KEY } from '@env';
import { auth, db } from '../config/FirebaseConfig';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Feather } from '@expo/vector-icons';
import LocationPickerModal, { LocationData } from '../components/LocationPickerModal';
import WeatherTile from '../components/WeatherTile';
import HistoryTile from '../components/HistoryTile';
import PromptTile from '../components/PromptTile';
import SpotlightTile from '../components/SpotlightTile';
import NeighborhoodPulseTile from '../components/NeighborhoodPulseTile'; // 👈 NEW IMPORT

const { height: screenHeight } = Dimensions.get('window');
const contentHeight = screenHeight * 0.8;

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>;

// --- Interfaces ---
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
interface AqiData {
  usAqi: number;
}
interface HistoryData {
  title: string;
  imageUrl: string | null;
}
interface SpotlightData {
  name: string;
  category: string;
  distance?: string;
}

// Utility
const truncateAddress = (address: string | undefined): string => {
  if (!address) return 'Set Location';
  const firstCommaIndex = address.indexOf(',');
  if (firstCommaIndex !== -1) {
    return address.substring(0, firstCommaIndex);
  }
  return address;
};

// Distance calculator
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 3959; // miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1);
};

const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [aqiData, setAqiData] = useState<AqiData | null>(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState(true);
  const [historyData, setHistoryData] = useState<HistoryData | null>(null);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [spotlightData, setSpotlightData] = useState<SpotlightData | null>(null);
  const [isSpotlightLoading, setIsSpotlightLoading] = useState(true);
  const [selectedPrompt, setSelectedPrompt] = useState('');

  // --- Fetch User Data ---
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

  // --- API Data ---
  useEffect(() => {
    const fetchApiData = async () => {
      if (userData?.location) {
        const { latitude, longitude } = userData.location;

        // Weather + AQI
        setIsWeatherLoading(true);
        try {
          const [weatherResponse, aqiResponse] = await Promise.all([
            fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&temperature_unit=fahrenheit`
            ),
            fetch(
              `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=us_aqi`
            ),
          ]);
          const weather = await weatherResponse.json();
          if (weather.current_weather) {
            setWeatherData({
              temperature: weather.current_weather.temperature,
              weatherCode: weather.current_weather.weathercode,
            });
          }
          const aqi = await aqiResponse.json();
          if (aqi.current) setAqiData({ usAqi: aqi.current.us_aqi });
        } catch (err) {
          console.error('Weather/AQI fetch failed:', err);
        } finally {
          setIsWeatherLoading(false);
        }

        // History
        setIsHistoryLoading(true);
        try {
          const historyUrl = `https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gsradius=10000&gscoord=${latitude}|${longitude}&format=json&origin=*`;
          const res = await fetch(historyUrl, {
            headers: { 'User-Agent': 'PulseApp/1.0' },
          });
          const data = await res.json();
          if (data.query?.geosearch?.length) {
            const title = data.query.geosearch[0].title;
            const imgUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
              title
            )}&per_page=1&orientation=portrait`;
            const imgRes = await fetch(imgUrl, {
              headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
            });
            const imgs = await imgRes.json();
            const imageUrl =
              imgs.results?.length > 0 ? imgs.results[0].urls.regular : null;
            setHistoryData({ title, imageUrl });
          } else setHistoryData(null);
        } catch (err) {
          console.error('History fetch failed:', err);
          setHistoryData(null);
        } finally {
          setIsHistoryLoading(false);
        }

        // Spotlight
        setIsSpotlightLoading(true);
        try {
          const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=5000&rankby=prominence&key=${GOOGLE_MAPS_API_KEY}`;
          const res = await fetch(url);
          const data = await res.json();
          if (data.results?.length) {
            const place = data.results[0];
            const dist = getDistance(
              latitude,
              longitude,
              place.geometry.location.lat,
              place.geometry.location.lng
            );
            setSpotlightData({
              name: place.name,
              category: place.types[0].replace(/_/g, ' '),
              distance: `${dist} mi`,
            });
          } else setSpotlightData(null);
        } catch (err) {
          console.error('Spotlight fetch failed:', err);
          setSpotlightData(null);
        } finally {
          setIsSpotlightLoading(false);
        }
      }
    };
    fetchApiData();
  }, [userData?.location]);

  // --- Header ---
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <TouchableOpacity
          style={styles.locationBar}
          onPress={() => setIsModalVisible(true)}
        >
          <Feather name="map-pin" size={16} color={Colors.accentCalm} />
          <Text
            style={styles.locationText}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
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
        await db.collection('users').doc(user.uid).update({ location });
      }
    } catch {
      Alert.alert('Error', 'Could not save location. Please try again.');
    } finally {
      setIsModalVisible(false);
    }
  };

  // --- Layout ---
  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.gridContainer}>
          {/* --- COLUMN 1 --- */}
          <View style={styles.column}>
            <TouchableOpacity
              style={{ height: contentHeight * 0.224, marginBottom: 16 }}
              onPress={() => navigation.navigate('DetailedWeather')}
            >
              <WeatherTile
                weatherData={weatherData}
                aqiData={aqiData}
                isLoading={isWeatherLoading}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={{ height: contentHeight * 0.364, marginBottom: 16 }}
              onPress={() => navigation.navigate('CreatePulse')}
            >
              <HistoryTile
                historyData={historyData}
                isLoading={isHistoryLoading}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={{ height: contentHeight * 0.1505, marginBottom: 16 }}
              onPress={() =>
                navigation.navigate('CreatePulse', { prefill: selectedPrompt })
              }
            >
              <PromptTile onSelectPrompt={setSelectedPrompt} />
            </TouchableOpacity>

            <TouchableOpacity
              style={{ height: contentHeight * 0.2135 }}
              onPress={() =>
                navigation.navigate('CreatePulse', {
                  locationTag: spotlightData?.name,
                })
              }
            >
              <SpotlightTile
                spotlightData={spotlightData}
                isLoading={isSpotlightLoading}
              />
            </TouchableOpacity>
          </View>

          {/* --- COLUMN 2 --- */}
          <View style={styles.column}>
            {/* Tile 1: Neighborhood Pulse */}
            <View style={{ height: contentHeight * 0.182, marginBottom: 16 }}>
              <NeighborhoodPulseTile />
            </View>

            {/* Future Column 2 tiles */}
          </View>
        </View>
      </ScrollView>

      {/* --- Tab Bar --- */}
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
    </View>
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
  gridContainer: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingTop: 16,
  },
  column: {
    flex: 1,
    paddingHorizontal: 8,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 15,
    paddingBottom: 25,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.backgroundDark,
  },
});

export default HomeScreen;
