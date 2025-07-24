import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEYS = {
  USER_PROFILE: 'USER_PROFILE',
};

async function getStorageItem(key: string) {
  const item = await AsyncStorage.getItem(key);
  return item ? JSON.parse(item) : null;
}

async function setStorageItem(key: string, value: any) {
  return await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function clearStorage() {
  return await AsyncStorage.clear();
}

export async function getUserProfile() {
  return await getStorageItem(STORAGE_KEYS.USER_PROFILE);
}

export async function setUserProfile(profile: any) {
  return await setStorageItem(STORAGE_KEYS.USER_PROFILE, profile);
}