import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { auth, db } from '../config/FirebaseConfig';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import Button from '../components/Button';
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

const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = db.collection('users').doc(user.uid);
        const docSnap = await userDocRef.get();
        if (docSnap.exists) {
          setUserData(docSnap.data() as UserData);
        }
      }
    };

    fetchUserData();
  }, []);

  const handleLocationSelect = async (location: LocationData) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = db.collection('users').doc(user.uid);
        await userDocRef.update({ location: location });
        // Update the local state to reflect the change immediately
        setUserData(prevData => ({ ...prevData, location }));
      }
    } catch (error) {
      Alert.alert('Error', 'Could not save location. Please try again.');
    } finally {
        setIsModalVisible(false); // Close the modal
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            try {
              await auth.signOut();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Entry' }],
              });
            } catch (error) {
              Alert.alert("Error", "Could not log out. Please try again.");
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View>
            <View style={styles.infoContainer}>
                <Text style={Typography.h1}>Welcome,</Text>
                <Text style={[Typography.h1, styles.username]}>{userData?.username || 'Neighbor'}</Text>
            </View>

            <View style={styles.infoContainer}>
                <View style={styles.locationHeader}>
                    <Text style={Typography.body}>Your Location:</Text>
                    <TouchableOpacity onPress={() => setIsModalVisible(true)}>
                        <Text style={styles.changeText}>Change</Text>
                    </TouchableOpacity>
                </View>
                <Text style={[Typography.body, styles.locationText]}>
                    {userData?.location?.address || 'Not set. Tap "Change" to set your location.'}
                </Text>
            </View>
        </View>

        <View style={styles.buttonContainer}>
            <Button title="Log Out" onPress={handleLogout} />
        </View>
      </View>
      
      <LocationPickerModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onLocationSelect={handleLocationSelect}
      />
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
    justifyContent: 'space-between',
    padding: 20,
  },
  infoContainer: {
    padding: 20,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginBottom: 20,
  },
  username: {
    color: Colors.accentCalm,
    marginTop: 4,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  changeText: {
    ...Typography.body,
    color: Colors.accentCalm,
    textDecorationLine: 'underline',
  },
  locationText: {
    color: Colors.textSecondary,
    marginTop: 8, // Increased margin for better spacing
  },
  buttonContainer: {
    // Pushes the button to the bottom
  }
});

export default HomeScreen;