
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { UserService } from "@/lib/services/user-service";
import { toast } from "sonner";
import { type UserProfile } from "@/types/user";
import { Loader2, Save, X } from "lucide-react";

interface UserEditSheetProps {
  user: UserProfile | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function UserEditSheet({
  user,
  isOpen,
  onOpenChange,
  onSuccess,
}: UserEditSheetProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
  });

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        name: user.name || "",
      });
    }
  }, [user, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;

    setLoading(true);
    try {
      await UserService.updateUser(user.uid, {
        name: formData.name,
      });
      toast.success("Data user berhasil diperbarui");
      onSuccess();
      onOpenChange(false);
    } catch (error: unknown) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan saat menyimpan data";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-135">
        <SheetHeader>
          <SheetTitle>Edit Pengguna</SheetTitle>
          <SheetDescription>
            Ubah informasi profil pengguna. Perubahan role hanya dapat dilakukan melalui menu "Assign to Role".
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-6 px-4">
          <div className="space-y-2">
            <Label htmlFor="edit-uid" className="text-muted-foreground">User ID</Label>
            <Input id="edit-uid" value={user.uid} disabled className="bg-muted font-mono text-xs" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-email" className="text-muted-foreground">Email</Label>
            <Input
              id="edit-email"
              value={user.email || ""}
              disabled
              className="bg-muted"
            />
            <p className="text-[10px] text-muted-foreground">
              Email diatur oleh sistem autentikasi dan tidak dapat diubah dari sini.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-name">Nama Lengkap</Label>
            <Input
              id="edit-name"
              value={formData.name || ""}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Masukkan nama lengkap"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground italic">Info Tambahan</Label>
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-xs text-yellow-800">
              <p>Role saat ini: <strong>{user.role}</strong></p>
              <p className="mt-1">
                Untuk mengubah role pengguna, gunakan menu dropdown <strong>"Assign to Role"</strong> pada tabel manajemen user.
              </p>
            </div>
          </div>

          <SheetFooter className="pt-4">
            <div className="flex w-full gap-3">
              <SheetClose asChild>
                <Button variant="outline" type="button" className="flex-1">
                  <X className="mr-2 h-4 w-4" /> Batal
                </Button>
              </SheetClose>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Simpan
              </Button>
            </div>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
