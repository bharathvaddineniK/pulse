import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';

interface NatureTileProps {
  natureData: {
    species: string;
  } | null;
  isLoading: boolean;
}

const NatureTile = ({ natureData, isLoading }: NatureTileProps) => {
  const renderContent = () => {
    if (isLoading) {
      return <ActivityIndicator color={Colors.accentCalm} />;
    }

    if (!natureData || !natureData.species) {
      return <Text style={styles.errorText}>Local nature data unavailable</Text>;
    }

    return (
      <>
        <Feather name="feather" size={48} color={Colors.textPrimary} />
        <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
          {natureData.species}
        </Text>
      </>
    );
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Local Nature</Text>
      <View style={styles.content}>
        {renderContent()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    minHeight: 150,
    justifyContent: 'center',
    marginTop: 16,
  },
  header: {
    position: 'absolute',
    top: 20,
    left: 20,
    ...Typography.body,
    color: Colors.textSecondary,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
  },
  title: {
    ...Typography.h2,
    fontSize: 20,
    textAlign: 'center',
    marginTop: 12,
  },
  errorText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});

export default NatureTile;