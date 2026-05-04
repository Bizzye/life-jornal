import { supabase } from '@/lib/supabase';
import { decode } from 'base64-arraybuffer';
import * as ImagePicker from 'expo-image-picker';

const BUCKET = 'entry-photos';

export const storageService = {
  async pickImage(): Promise<string | null> {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      base64: true,
      allowsEditing: true,
    });

    if (result.canceled || !result.assets[0].base64) return null;
    return result.assets[0].base64;
  },

  async upload(userId: string, base64: string): Promise<string> {
    const fileName = `${userId}/${Date.now()}.jpg`;
    const { error } = await supabase.storage.from(BUCKET).upload(fileName, decode(base64), {
      contentType: 'image/jpeg',
      upsert: false,
    });
    if (error) throw error;

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
    return data.publicUrl;
  },

  async remove(url: string) {
    const path = url.split(`${BUCKET}/`)[1];
    if (!path) return;
    const { error } = await supabase.storage.from(BUCKET).remove([path]);
    if (error) throw error;
  },
};
