import { useState } from "react";
import { storageService } from "@/services/storage.service";
import { useAuthStore } from "@/stores/auth.store";

export function useImagePicker() {
  const [uploading, setUploading] = useState(false);
  const userId = useAuthStore((s) => s.user?.id);

  const pickAndUpload = async (): Promise<string | null> => {
    if (!userId) return null;
    const base64 = await storageService.pickImage();
    if (!base64) return null;

    setUploading(true);
    try {
      return await storageService.upload(userId, base64);
    } finally {
      setUploading(false);
    }
  };

  return { pickAndUpload, uploading };
}
