import authModule from '@react-native-firebase/auth';
import firestoreModule from '@react-native-firebase/firestore';

// The libraries initialize themselves using the native config files.
// We just get the singleton instances and export them with the expected names.
export const auth = authModule();
export const db = firestoreModule();