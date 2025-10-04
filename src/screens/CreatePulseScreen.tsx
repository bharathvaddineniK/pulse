import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Feather } from '@expo/vector-icons';

const CreatePulseScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Feather name="edit" size={64} color={Colors.textSecondary} />
        <Text style={[Typography.h2, styles.title]}>Create a Pulse</Text>
        <Text style={[Typography.body, {color: Colors.textSecondary, textAlign: 'center'}]}>
          The form to create a new Pulse will be built here.
        </Text>
      </View>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    marginTop: 24,
    marginBottom: 8,
  }
});

export default CreatePulseScreen;