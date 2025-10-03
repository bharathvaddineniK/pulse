import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  StatusBar,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE, Region } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GOOGLE_MAPS_API_KEY } from '@env';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import Button from './Button';
import { mapStyle } from '../constants/mapStyle';

export interface LocationData {
  address: string;
  latitude: number;
  longitude: number;
}

// Add a label for saved locations
export interface SavedLocation extends LocationData {
  label: string;
}

interface LocationPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onLocationSelect: (location: LocationData) => void;
}

const LocationPickerModal = ({
  visible,
  onClose,
  onLocationSelect,
}: LocationPickerModalProps) => {
  const [view, setView] = useState<'search' | 'map'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [predictions, setPredictions] = useState<any[]>([]);
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [region, setRegion] = useState<Region>({
    latitude: 37.7749,
    longitude: -122.4194,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  // Load saved locations from AsyncStorage when the modal becomes visible
  useEffect(() => {
    const loadSavedLocations = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('@saved_locations');
        if (jsonValue != null) {
          setSavedLocations(JSON.parse(jsonValue));
        } else {
          // For now, let's add some placeholder data to see the UI
          setSavedLocations([
              { label: 'Home', address: '123 Main St, Sunnyvale, CA', latitude: 37.38, longitude: -122.03 },
              { label: 'Work', address: '456 Tech Park, Mountain View, CA', latitude: 37.42, longitude: -122.08 },
          ]);
        }
      } catch (e) {
        console.error("Failed to load locations.", e);
      }
    };

    if (visible) {
      loadSavedLocations();
      setSearchQuery('');
      setPredictions([]);
      setView('search');
    }
  }, [visible]);


  useEffect(() => {
    if (searchQuery.length < 3) {
      setPredictions([]);
      return;
    }
    const handler = setTimeout(async () => {
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
        searchQuery
      )}&key=${GOOGLE_MAPS_API_KEY}`;
      try {
        const response = await fetch(url);
        const json = await response.json();
        if (json.status === 'OK') {
          setPredictions(json.predictions);
        } else {
          console.error('Google Places API Error:', json.error_message);
        }
      } catch (error) {
        console.error(error);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const handleSelectPlace = async (placeId: string) => {
    Keyboard.dismiss();
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_MAPS_API_KEY}`;
    try {
      const response = await fetch(url);
      const json = await response.json();
      if (json.status === 'OK') {
        const { lat, lng } = json.result.geometry.location;
        onLocationSelect({
          address: json.result.formatted_address,
          latitude: lat,
          longitude: lng,
        });
        onClose();
      } else {
        Alert.alert('Error', 'Could not fetch location details.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred fetching location details.');
    }
  };

  const handleConfirmLocation = async () => {
    const { latitude, longitude } = region;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`;
    try {
      const response = await fetch(url);
      const json = await response.json();
      if (json.status === 'OK' && json.results.length > 0) {
        onLocationSelect({
          address: json.results[0].formatted_address,
          latitude,
          longitude,
        });
        onClose();
      } else {
        Alert.alert('Error', 'Could not determine address for this location.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred fetching the address.');
    }
  };

  const renderSearchView = () => (
    <View style={styles.content}>
      {/* --- NEW SAVED LOCATIONS SECTION --- */}
      {savedLocations.length > 0 && (
        <View style={styles.savedContainer}>
            <Text style={styles.savedHeader}>Saved Locations</Text>
            {savedLocations.map((item) => (
                <TouchableOpacity
                    key={item.label}
                    style={styles.savedItem}
                    onPress={() => {
                        onLocationSelect(item);
                        onClose();
                    }}
                >
                    <Feather name="star" size={20} color={Colors.accentElevated} style={styles.savedIcon} />
                    <View>
                        <Text style={Typography.body}>{item.label}</Text>
                        <Text style={styles.savedAddress}>{item.address}</Text>
                    </View>
                </TouchableOpacity>
            ))}
        </View>
      )}
      {/* ------------------------------------ */}

      <TextInput
        style={styles.searchInput}
        placeholder="Search for a place or address"
        placeholderTextColor={Colors.textSecondary}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      {predictions.length > 0 && (
        <FlatList
          data={predictions}
          keyExtractor={item => item.place_id}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.listRow}
              onPress={() => handleSelectPlace(item.place_id)}>
              <Text style={Typography.body}>{item.description}</Text>
            </TouchableOpacity>
          )}
          style={styles.listView}
        />
      )}
      <View style={styles.spacer} />
      <TouchableOpacity
        style={styles.chooseOnMapButton}
        onPress={() => setView('map')}>
        <Feather name="map" size={16} color={Colors.textSecondary} />
        <Text style={styles.chooseOnMapText}>Choose on Map</Text>
      </TouchableOpacity>
    </View>
  );

  const renderMapView = () => (
    <View style={styles.mapContainer}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFill}
        initialRegion={region}
        onRegionChangeComplete={setRegion}
        customMapStyle={mapStyle}
      />
      <View style={styles.pinContainer}>
        <Feather name="map-pin" size={40} color={Colors.accentUrgent} />
      </View>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setView('search')}>
        <Feather name="arrow-left" size={24} color={Colors.textPrimary} />
      </TouchableOpacity>
      <View style={styles.confirmButtonContainer}>
        <Button title="Confirm Location" onPress={handleConfirmLocation} />
      </View>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <TouchableWithoutFeedback
          onPress={() => Keyboard.dismiss()}
          accessible={false}>
          <View style={{ flex: 1 }}>
            <View style={styles.header}>
              <Text style={Typography.h2}>Set Your Neighborhood</Text>
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.closeButton}>Close</Text>
              </TouchableOpacity>
            </View>
            {view === 'search' ? renderSearchView() : renderMapView()}
          </View>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundDark,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surface,
  },
  closeButton: { ...Typography.body, color: Colors.accentCalm },
  content: { flex: 1, padding: 20 },
  // --- NEW STYLES for Saved Locations ---
  savedContainer: {
    marginBottom: 20,
  },
  savedHeader: {
      ...Typography.h2,
      marginBottom: 10,
  },
  savedItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: Colors.surface,
  },
  savedIcon: {
      marginRight: 15,
  },
  savedAddress: {
      ...Typography.metadata,
      marginTop: 2,
  },
  // ------------------------------------
  searchInput: {
    ...Typography.body,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 12,
    color: Colors.textPrimary,
  },
  listView: {
    backgroundColor: Colors.surface,
    marginTop: 8,
    borderRadius: 8,
    flexGrow: 0,
  },
  listRow: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.backgroundDark,
  },
  spacer: {
    flex: 1,
  },
  chooseOnMapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  chooseOnMapText: {
    ...Typography.metadata,
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  mapContainer: {
    flex: 1,
  },
  pinContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40, 
    pointerEvents: 'none',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 20,
  },
  confirmButtonContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
  },
});

export default LocationPickerModal;