import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

interface HistoryTileProps {
  historyData: {
    title: string;
    imageUrl: string | null;
  } | null;
  isLoading: boolean;
}

const FALLBACK_IMAGE = require('../assets/images/img1.jpg');

// We need to get the navigation prop to handle the button press
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const HistoryTile = ({ historyData, isLoading }: HistoryTileProps) => {
  const navigation = useNavigation<NavigationProp>();

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={Colors.accentCalm} />
      </View>
    );
  }

  const imageSource = historyData?.imageUrl ? { uri: historyData.imageUrl } : FALLBACK_IMAGE;
  const displayTitle = historyData?.title || 'Discover Local History';

  return (
    <ImageBackground
      source={imageSource}
      style={styles.container}
      imageStyle={{ borderRadius: 16, opacity: 0.4 }} // Apply styles to the inner image
      resizeMode="cover"
    >
      <LinearGradient
        // The gradient now darkens the image from top to bottom for readability
        colors={['rgba(30, 30, 30, 0.2)', 'rgba(30, 30, 30, 0.9)']}
        style={styles.gradient}
      >
        <View>
          <Text style={styles.title}>This Place in History</Text>
          <Text style={styles.bodyText} numberOfLines={2}>{displayTitle}</Text>
        </View>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('CreatePulse')} // Navigate on press
        >
          <Text style={styles.buttonText}>Add Photo</Text>
        </TouchableOpacity>
      </LinearGradient>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(100, 100, 100, 0.2)',
    backgroundColor: 'rgba(30, 30, 30, 0.75)',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
    borderRadius: 16,
  },
  title: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  bodyText: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  button: {
    backgroundColor: Colors.accentCalm,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  buttonText: {
    ...Typography.button,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default HistoryTile;