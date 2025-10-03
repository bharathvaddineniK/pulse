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
  ActivityIndicator,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE, Region } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { GOOGLE_MAPS_API_KEY } from '@env';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import Button from './Button';
import { mapStyle } from '../constants/mapStyle';
import SaveLocationModal from './SaveLocationModal';
import EditLocationModal from './EditLocationModal'; // Import the new modal

export interface LocationData {
  address: string;
  latitude: number;
  longitude: number;
}

export interface SavedLocation extends LocationData {
  label: string;
}

interface LocationToSave {
    placeId: string;
    description: string;
}

interface LocationPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onLocationSelect: (location: LocationData) => void;
  showSaveButton?: boolean;
  showPreciseLocation?: boolean;
}

const STORAGE_KEY = '@saved_locations';

const LocationPickerModal = ({
  visible,
  onClose,
  onLocationSelect,
  showSaveButton = false,
  showPreciseLocation = false,
}: LocationPickerModalProps) => {
  const [view, setView] = useState<'search' | 'map'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [predictions, setPredictions] = useState<any[]>([]);
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [isSaveModalVisible, setIsSaveModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [locationToSave, setLocationToSave] = useState<LocationToSave | null>(null);
  const [locationToEdit, setLocationToEdit] = useState<SavedLocation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [region, setRegion] = useState<Region>({
    latitude: 37.7749,
    longitude: -122.4194,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const loadSavedLocations = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      if (jsonValue != null) {
        setSavedLocations(JSON.parse(jsonValue));
      }
    } catch (e) {
      console.error("Failed to load locations.", e);
    }
  };

  useEffect(() => {
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

  const openSaveModal = (placeId: string, description: string) => {
    if (savedLocations.length >= 3) {
      Alert.alert('Limit Reached', 'You can only save up to 3 favorite locations.');
      return;
    }
    setLocationToSave({ placeId, description });
    setIsSaveModalVisible(true);
  };
  
  const handleSaveLabeledLocation = async (label: string) => {
    if (!locationToSave) return;
  
    if (savedLocations.find(loc => loc.label.toLowerCase() === label.toLowerCase())) {
      Alert.alert('Label Exists', 'A location with this label already exists. Please choose a different label.');
      return;
    }
  
    const { placeId, description } = locationToSave;
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_MAPS_API_KEY}`;
    try {
      const response = await fetch(url);
      const json = await response.json();
      if (json.status === 'OK') {
        const { lat, lng } = json.result.geometry.location;
        const newLocation: SavedLocation = { label, address: description, latitude: lat, longitude: lng };
        const updatedLocations = [...savedLocations, newLocation];
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLocations));
        setSavedLocations(updatedLocations);
        setIsSaveModalVisible(false);
        setLocationToSave(null);
      } else {
        throw new Error('Failed to fetch place details.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while saving the location.');
    }
  };

  const handlePreciseLocation = async () => {
    setIsLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'To use your precise location, please grant permission in your device settings.');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`;
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
        throw new Error('Could not determine address.');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not get your current location.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLocation = (label: string) => {
    Alert.alert(
      'Delete Location',
      `Are you sure you want to delete "${label}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedLocations = savedLocations.filter(loc => loc.label !== label);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLocations));
            setSavedLocations(updatedLocations);
          },
        },
      ]
    );
  };
  
  const openEditModal = (location: SavedLocation) => {
    setLocationToEdit(location);
    setIsEditModalVisible(true);
  };

  const handleEditLabel = async (newLabel: string) => {
    if (!locationToEdit) return;

    if (newLabel.toLowerCase() !== locationToEdit.label.toLowerCase() && savedLocations.some(loc => loc.label.toLowerCase() === newLabel.toLowerCase())) {
        Alert.alert('Label Exists', 'A location with this label already exists.');
        return;
    }

    const updatedLocations = savedLocations.map(loc =>
        loc.label === locationToEdit.label ? { ...loc, label: newLabel } : loc
    );
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLocations));
    setSavedLocations(updatedLocations);
    setIsEditModalVisible(false);
    setLocationToEdit(null);
  };

  const renderInitialOptions = () => (
    <View style={styles.initialOptionsContainer}>
        {showPreciseLocation && (
            <TouchableOpacity style={styles.optionRow} onPress={handlePreciseLocation}>
                <Feather name="navigation" size={20} color={Colors.accentCalm} style={styles.optionIcon} />
                <Text style={Typography.body}>Use My Precise Location</Text>
            </TouchableOpacity>
        )}
        {showSaveButton && savedLocations.length > 0 && (
            <>
                {savedLocations.map((item) => (
                    <TouchableOpacity
                        key={item.label}
                        style={styles.optionRow}
                        onPress={() => {
                            onLocationSelect(item);
                            onClose();
                        }}
                    >
                        <Feather name="star" size={20} color={Colors.accentElevated} style={styles.optionIcon} />
                        <View style={styles.optionTextContainer}>
                            <Text style={Typography.body}>{item.label}</Text>
                            <Text style={styles.savedAddress}>{item.address}</Text>
                        </View>
                        <View style={styles.editButtons}>
                            <TouchableOpacity onPress={() => openEditModal(item)}><Feather name="edit-2" size={20} color={Colors.textSecondary} /></TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDeleteLocation(item.label)}><Feather name="trash-2" size={20} color={Colors.textSecondary} style={{marginLeft: 15}}/></TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                ))}
            </>
        )}
    </View>
  );

  const renderSearchView = () => (
    <View style={styles.content}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search for a place or address"
        placeholderTextColor={Colors.textSecondary}
        value={searchQuery}
        onChangeText={setSearchQuery}
        autoFocus={!showPreciseLocation && !showSaveButton}
      />
      {isLoading ? (
          <ActivityIndicator size="large" color={Colors.accentCalm} style={{marginTop: 20}}/>
      ) : searchQuery.length > 0 ? (
        <FlatList
          data={predictions}
          keyExtractor={item => item.place_id}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <View style={styles.listRow}>
                <TouchableOpacity style={styles.listRowContent} onPress={() => handleSelectPlace(item.place_id)}>
                    <Text style={Typography.body}>{item.description}</Text>
                </TouchableOpacity>
                {showSaveButton && (
                  <TouchableOpacity style={styles.saveButton} onPress={() => openSaveModal(item.place_id, item.description)}>
                      <Feather name="star" size={22} color={Colors.textSecondary} />
                  </TouchableOpacity>
                )}
            </View>
          )}
          style={styles.listView}
        />
      ) : (
        renderInitialOptions()
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
    <>
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
      <SaveLocationModal 
        visible={isSaveModalVisible}
        onClose={() => setIsSaveModalVisible(false)}
        onSave={handleSaveLabeledLocation}
      />
      {locationToEdit && (
          <EditLocationModal
            visible={isEditModalVisible}
            onClose={() => setIsEditModalVisible(false)}
            onSave={handleEditLabel}
            initialLabel={locationToEdit.label}
          />
      )}
    </>
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
    searchInput: {
      ...Typography.body,
      backgroundColor: Colors.surface,
      borderRadius: 8,
      padding: 12,
      color: Colors.textPrimary,
      marginBottom: 10,
    },
    initialOptionsContainer: {
        // Container for the initial rows
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: Colors.surface,
    },
    optionIcon: {
        marginRight: 15,
    },
    optionTextContainer: {
        flex: 1,
    },
    savedAddress: {
        ...Typography.metadata,
        marginTop: 2,
    },
    editButtons: {
        flexDirection: 'row',
    },
    listView: {
      backgroundColor: Colors.surface,
      borderRadius: 8,
      flexGrow: 0,
    },
    listRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingLeft: 12,
      borderBottomWidth: 1,
      borderBottomColor: Colors.backgroundDark,
    },
    listRowContent: {
        flex: 1,
        paddingVertical: 12,
    },
    saveButton: {
        padding: 12,
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