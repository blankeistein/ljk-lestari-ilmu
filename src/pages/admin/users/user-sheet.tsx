
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { UserService } from "@/lib/services/user-service";
import { toast } from "sonner";
import { type UserProfile, ROLE_LABELS } from "@/types/user";
import { Loader2 } from "lucide-react";

interface UserSheetProps {
  user: UserProfile | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  mode: "edit" | "detail" | "create";
}

export function UserSheet({
  user,
  isOpen,
  onOpenChange,
  onSuccess,
  mode,
}: UserSheetProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    email: "",
    name: "",
    role: "user",
  });

  useEffect(() => {
    if (user && (mode === "edit" || mode === "detail")) {
      setFormData({
        email: user.email,
        name: user.name,
        role: user.role,
      });
    } else {
      setFormData({
        email: "",
        name: "",
        role: "user",
      });
    }
  }, [user, mode, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "create") {
        // Note: Creating auth users requires backend/admin SDK.
        // We can only simulate creating a profile record here if user already exists
        // or user creation is handled elsewhere.
        // For this demo, let's assume we are updating profile or creating placeholder.
        toast.error("Pembuatan user baru harus melalui halaman Register atau Admin SDK");
        // Implementing Firestore creation only
      } else if (mode === "edit" && user?.uid) {
        await UserService.updateUser(user.uid, {
          name: formData.name,
          role: formData.role,
        });
        toast.success("Data user berhasil diperbarui");
        onSuccess();
        onOpenChange(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan saat menyimpan data");
    } finally {
      setLoading(false);
    }
  };

  const isReadOnly = mode === "detail";

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-135">
        <SheetHeader>
          <SheetTitle>
            {mode === "create"
              ? "Tambah User"
              : mode === "edit"
                ? "Edit User"
                : "Detail User"}
          </SheetTitle>
          <SheetDescription>
            {mode === "detail"
              ? "Informasi detail pengguna"
              : "Isi formulir untuk mengubah data pengguna"}
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-6 px-4">
          <div className="space-y-2">
            <Label htmlFor="uid">User ID</Label>
            <Input id="uid" value={user?.uid || "-"} disabled />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={formData.email || ""}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              disabled={true} // Email usually shouldn't be changed directly in Firestore as it's linked to Auth
              placeholder="email@example.com"
            />
            {mode === "edit" && <p className="text-xs text-muted-foreground">Email tidak dapat diubah dari sini.</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nama Lengkap</Label>
            <Input
              id="name"
              value={formData.name || ""}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              disabled={isReadOnly}
              placeholder="Nama Lengkap User"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value: string) =>
                setFormData({ ...formData, role: value })
              }
              disabled={isReadOnly}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Role" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ROLE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!isReadOnly && (
            <SheetFooter>
              <SheetClose asChild>
                <Button variant="outline" type="button">Batal</Button>
              </SheetClose>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Perubahan
              </Button>
            </SheetFooter>
          )}
        </form>
      </SheetContent>
    </Sheet>
  );
}
