import AsyncStorage from '@react-native-async-storage/async-storage';

// Adapter to match MMKV-like synchronous API where possible, 
// but fundamentally Async Storage is async.
// We will export a simple wrapper.

export const storage = {
  setItem: async (key: string, value: string) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      console.error("Storage Error:", e);
    }
  },
  getItem: async (key: string) => {
    try {
      return await AsyncStorage.getItem(key);
    } catch (e) {
      console.error("Storage Error:", e);
      return null;
    }
  },
  removeItem: async (key: string) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.error("Storage Error:", e);
    }
  }
};
