import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Alert, Dimensions } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { UNSPLASH_ACCESS_KEY } from '@env';
import { auth, db } from '../config/FirebaseConfig';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Feather } from '@expo/vector-icons';
import LocationPickerModal, { LocationData } from '../components/LocationPickerModal';
import WeatherTile from '../components/WeatherTile';
import HistoryTile from '../components/HistoryTile';

const { height: screenHeight } = Dimensions.get('window');
const contentHeight = screenHeight * 0.8; 

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

interface AqiData {
    usAqi: number;
}

interface HistoryData {
    title: string;
    imageUrl: string | null;
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
  const [aqiData, setAqiData] = useState<AqiData | null>(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState(true);
  const [historyData, setHistoryData] = useState<HistoryData | null>(null);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);

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

  useEffect(() => {
    const fetchApiData = async () => {
      if (userData?.location) {
        const { latitude, longitude } = userData.location;
        
        setIsWeatherLoading(true);
        try {
          const [weatherResponse, aqiResponse] = await Promise.all([
            fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&temperature_unit=fahrenheit`),
            fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=us_aqi`)
          ]);

          const weather = await weatherResponse.json();
          if (weather.current_weather) { setWeatherData({ temperature: weather.current_weather.temperature, weatherCode: weather.current_weather.weathercode, }); }
          const aqi = await aqiResponse.json();
          if (aqi.current) { setAqiData({ usAqi: aqi.current.us_aqi }); }
        } catch (error) {
          console.error("Failed to fetch weather or AQI data:", error);
        } finally {
          setIsWeatherLoading(false);
        }

        setIsHistoryLoading(true);
        try {
            const historyUrl = `https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gsradius=10000&gscoord=${latitude}|${longitude}&format=json&origin=*`;
            const historyResponse = await fetch(historyUrl, {
              headers: { 'User-Agent': 'PulseApp/1.0' }
            });
            const history = await historyResponse.json();
            
            if (history.query && history.query.geosearch && history.query.geosearch.length > 0) {
                const locationTitle = history.query.geosearch[0].title;

                const unsplashUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(locationTitle)}&per_page=1&orientation=portrait`;
                const imageResponse = await fetch(unsplashUrl, {
                    headers: { 'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}` }
                });
                const images = await imageResponse.json();
                
                const imageUrl = images.results && images.results.length > 0 ? images.results[0].urls.regular : null;

                setHistoryData({ title: locationTitle, imageUrl });
            } else {
                setHistoryData(null);
            }
        } catch (error) {
            console.error("Failed to fetch history:", error);
            setHistoryData(null);
        } finally {
            setIsHistoryLoading(false);
        }
      }
    };

    fetchApiData();
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
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.gridContainer}>
          {/* --- COLUMN 1 --- */}
          <View style={styles.column}>
            {/* Column 1, Tile 1 */}
            <TouchableOpacity
              style={{ height: contentHeight * 0.224, marginBottom: 16 }}
              onPress={() => navigation.navigate('DetailedWeather')}
            >
              <WeatherTile weatherData={weatherData} aqiData={aqiData} isLoading={isWeatherLoading} />
            </TouchableOpacity>

            {/* Column 1, Tile 2 */}
            <TouchableOpacity
              style={{ height: contentHeight * 0.364, marginBottom: 16 }}
              onPress={() => navigation.navigate('CreatePulse')}
            >
              <HistoryTile historyData={historyData} isLoading={isHistoryLoading} />
            </TouchableOpacity>
          </View>

          {/* --- COLUMN 2 --- */}
          <View style={styles.column}>
            {/* Tiles for Column 2 will go here */}
          </View>
        </View>
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
    // paddingTop: 16, // <-- This was the cause of the gap. It has been removed.
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