import { StyleSheet } from 'react-native';
import { Colors } from './Colors';

export const Typography = StyleSheet.create({
  h1: {
    fontFamily: 'Inter_700Bold',
    fontSize: 32, // [cite: 80]
    color: Colors.textPrimary,
  },
  h2: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24, // A reasonable size for H2, smaller than H1.
    color: Colors.textPrimary,
  },
  body: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16, // [cite: 85]
    color: Colors.textPrimary,
  },
  metadata: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12, // A reasonable size for fine print.
    color: Colors.textSecondary,
  },
  button: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: Colors.backgroundDark, // [cite: 89]
  },
});