import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import "react-native-url-polyfill/auto";

const secureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

const webStorageAdapter = {
  getItem: (key: string) => globalThis.localStorage?.getItem(key) ?? null,
  setItem: (key: string, value: string) =>
    globalThis.localStorage?.setItem(key, value),
  removeItem: (key: string) => globalThis.localStorage?.removeItem(key),
};

const supabaseUrl =
  Platform.OS === "web"
    ? process.env.EXPO_PUBLIC_SUPABASE_URL!.replace(
        /^(https?:\/\/)[^:]+(\:\d+)/,
        "$1localhost$2",
      )
    : process.env.EXPO_PUBLIC_SUPABASE_URL!;

export const supabase = createClient(
  supabaseUrl,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: Platform.OS === "web" ? webStorageAdapter : secureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);
