import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { auth, db } from '../config/FirebaseConfig';
import { Colors } from '../constants/Colors';
import OnboardingSlide from '../components/OnboardingSlide';
import Button from '../components/Button';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    iconName: 'grid',
    title: 'Your Neighborhood at a Glance',
    description:
      'The Bento Grid provides a live summary of local activity, showing you what matters most right now.',
  },
  {
    id: '2',
    iconName: 'tool',
    title: 'Real-time Utility',
    description:
      'Pulses are for tangible actions like alerts or offers, expiring to keep the feed fresh and relevant.',
  },
  {
    id: '3',
    iconName: 'shield',
    title: 'Private & Secure',
    description:
      'Our "Verified Pseudonymity" model ensures a trusted community, with features like Secure Connect to protect your privacy.',
  },
];

type OnboardingScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Onboarding'
>;

interface OnboardingScreenProps {
  navigation: OnboardingScreenNavigationProp;
}

const OnboardingScreen = ({ navigation }: OnboardingScreenProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

  const handleNextPress = async () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      setIsLoading(true);
      try {
        const user = auth.currentUser;
        if (user) {
          // Use the new API for updating the document
          const userDocRef = db.collection('users').doc(user.uid);
          await userDocRef.update({ onboardingComplete: true });
          navigation.navigate('LocationPermission');
        } else {
          Alert.alert(
            'Authentication Error',
            'Could not find your user session. Please restart the app.'
          );
        }
      } catch (error) {
        Alert.alert('Error', 'Could not update profile. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const renderSlide = ({ item }: { item: typeof slides[0] }) => {
    return (
      <View style={styles.slideContainer}>
        <OnboardingSlide
          iconName={item.iconName as any}
          title={item.title}
          description={item.description}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.id}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />
      <View style={styles.footer}>
        <View style={styles.indicatorContainer}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                currentIndex === index && styles.indicatorActive,
              ]}
            />
          ))}
        </View>
        <Button
          title={currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          onPress={handleNextPress}
        />
      </View>
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
  },
  slideContainer: {
    width,
    flex: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 40,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  indicator: {
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: Colors.surface,
    marginHorizontal: 4,
  },
  indicatorActive: {
    backgroundColor: Colors.accentCalm,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default OnboardingScreen;