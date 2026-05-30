import { StyleSheet } from 'react-native';
import { Colors } from './Colors';

export const Typography = StyleSheet.create({
  h1: {
    fontFamily: 'Inter_700Bold',
    fontSize: 32,
    color: Colors.textPrimary,
  },
  h2: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    color: Colors.textPrimary,
  },
  h3: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: Colors.textPrimary,
  },
  body: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: Colors.textPrimary,
  },
  metadata: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.textSecondary,
  },
  button: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: Colors.backgroundDark,
  },
});
