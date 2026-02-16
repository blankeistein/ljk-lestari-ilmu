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
import { ROLE_LABELS } from "@/types/user";
import { Loader2 } from "lucide-react";

interface AddUserSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddUserSheet({
  isOpen,
  onOpenChange,
  onSuccess,
}: AddUserSheetProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    role: "teacher",
    password: "",
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        email: "",
        name: "",
        role: "teacher",
        password: "",
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password || !formData.name || !formData.role) {
      toast.error("Semua field harus diisi");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password minimal 6 karakter");
      return;
    }

    setLoading(true);
    try {
      await UserService.createUser({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        role: formData.role,
      });
      toast.success("User baru berhasil dibuat");
      onSuccess();
      onOpenChange(false);
    } catch (error: unknown) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Gagal membuat user baru";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-135">
        <SheetHeader>
          <SheetTitle>Tambah User Baru</SheetTitle>
          <SheetDescription>
            Buat akun baru dengan email dan password. User akan terdaftar di sistem autentikasi.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-6 px-4">
          <div className="space-y-2">
            <Label htmlFor="add-name">Nama Lengkap</Label>
            <Input
              id="add-name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Nama Lengkap User"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="add-email">Email</Label>
            <Input
              id="add-email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="email@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="add-password">Password</Label>
            <Input
              id="add-password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder="Minimal 6 karakter"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="add-role">Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value: string) =>
                setFormData({ ...formData, role: value })
              }
            >
              <SelectTrigger id="add-role">
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

          <SheetFooter>
            <SheetClose asChild>
              <Button variant="outline" type="button">Batal</Button>
            </SheetClose>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Buat User
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
