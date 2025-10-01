import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // <-- Changed this line
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import PulseLogo from '../components/PulseLogo';
import ValuePropItem from '../components/ValuePropItem';
import Button from '../components/Button';
import TextLink from '../components/TextLink';

type EntryScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Entry'
>;

interface EntryScreenProps {
  navigation: EntryScreenNavigationProp;
}

const EntryScreen = ({ navigation }: EntryScreenProps) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.mainContent}>
          <PulseLogo />
          <Text style={[Typography.h1, styles.tagline]}>
            The live pulse of your neighborhood.
          </Text>
          <View style={styles.principlesList}>
            <ValuePropItem label="Real Neighbors, Real Pulses" />
            <ValuePropItem label="Private & Secure by Design" />
            <ValuePropItem label="Live, Ephemeral Updates" />
          </View>
        </View>

        <View style={styles.footerContainer}>
          <Button
            title="Become a Verified Neighbor"
            onPress={() => navigation.navigate('Verification')}
          />
          <TextLink
            label="Skip for now"
            onPress={() => {}}
            style={styles.skipLink}
          />
          <Text style={styles.legalText}>
            By entering, you agree to our{' '}
            <Text style={styles.legalLink} onPress={() => {}}>
              Terms of Service
            </Text>
            {' and '}
            <Text style={styles.legalLink} onPress={() => {}}>
              Privacy Policy
            </Text>
            .
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

// ...styles remain the same
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.backgroundDark,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
    justifyContent: 'space-between',
  },
  mainContent: {
    alignItems: 'center',
  },
  tagline: {
    textAlign: 'center',
    marginTop: 16,
  },
  principlesList: {
    marginTop: 32,
  },
  footerContainer: {},
  skipLink: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
  },
  legalText: {
    ...Typography.metadata,
    textAlign: 'center',
    marginTop: 24,
  },
  legalLink: {
    color: Colors.textPrimary,
    textDecorationLine: 'underline',
  },
});

export default EntryScreen;