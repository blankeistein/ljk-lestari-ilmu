import { useState, useEffect } from "react";
import { toast } from "sonner";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage, db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";

export function useAdminProfile() {
  const { profile, refreshProfile } = useAuth();
  const [name, setName] = useState("");
  const [photoUrl, setPhotoUrl] = useState(""); // Current URL in database
  const [pendingImage, setPendingImage] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setPhotoUrl(profile.photoUrl || "");
      setPreviewUrl(profile.photoUrl || "");
    }
  }, [profile]);

  // Clean up preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const processImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const size = Math.min(img.width, img.height);
          const startX = (img.width - size) / 2;
          const startY = (img.height - size) / 2;

          const finalSize = Math.min(size, 500);

          canvas.width = finalSize;
          canvas.height = finalSize;
          const ctx = canvas.getContext("2d");
          if (!ctx) return reject(new Error("Canvas context available"));

          ctx.drawImage(img, startX, startY, size, size, 0, 0, finalSize, finalSize);
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Failed to create blob"));
          }, "image/webp", 0.8);
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleDeletePhoto = () => {
    setPendingImage(null);
    setPreviewUrl("");
    setIsDeleted(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile?.uid) return;

    try {
      setLoading(true);
      const processedBlob = await processImage(file);

      // Create local preview
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
      const localUrl = URL.createObjectURL(processedBlob);

      setPendingImage(processedBlob);
      setPreviewUrl(localUrl);
      setIsDeleted(false);
      toast.success("Gambar siap disimpan!");
    } catch (error) {
      console.error("Error processing photo:", error);
      toast.error("Gagal memproses foto");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.uid) return;

    try {
      setLoading(true);
      let finalPhotoUrl = photoUrl;

      // 1. Handle actual file changes in Storage
      if (isDeleted || pendingImage) {
        // Delete old photo from storage if it exists
        if (photoUrl && photoUrl.includes(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET)) {
          try {
            const oldRef = ref(storage, photoUrl);
            await deleteObject(oldRef);
          } catch (err) {
            console.warn("Old photo already gone or error deleting:", err);
          }
        }
        finalPhotoUrl = "";
      }

      // 2. Upload new photo if pending
      if (pendingImage) {
        const storageRef = ref(storage, `profiles/${profile.uid}/avatar-${Date.now()}.webp`);
        const snapshot = await uploadBytes(storageRef, pendingImage);
        finalPhotoUrl = await getDownloadURL(snapshot.ref);
      }

      // 3. Update Firestore
      await updateDoc(doc(db, "users", profile.uid), {
        name: name.trim(),
        photoUrl: finalPhotoUrl,
      });

      if (refreshProfile) {
        await refreshProfile();
      }

      // Reset local states
      setPendingImage(null);
      setPhotoUrl(finalPhotoUrl);
      setPreviewUrl(finalPhotoUrl);
      setIsDeleted(false);

      toast.success("Profil berhasil diperbarui!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Gagal memperbarui profil");
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    name,
    setName,
    photoUrl: previewUrl,
    loading,
    uploading: loading && !previewUrl.startsWith("http"),
    handleDeletePhoto,
    handleFileUpload,
    handleSubmit
  };
}
