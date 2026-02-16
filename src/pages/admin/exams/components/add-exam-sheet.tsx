import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
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
import { ExamService } from "@/lib/services/exam-service";
import { type ExamStatus } from "@/types/exam";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AddExamSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddExamSheet({
  open,
  onOpenChange,
  onSuccess,
}: AddExamSheetProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    status: "draft" as ExamStatus,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Nama ujian harus diisi");
      return;
    }

    setLoading(true);
    try {
      await ExamService.createExam({
        name: formData.name,
        status: formData.status,
      });

      toast.success("Sesi ujian berhasil ditambahkan");
      setFormData({
        name: "",
        status: "draft",
      });
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating exam:", error);
      toast.error("Gagal menambahkan sesi ujian");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Tambah Sesi Ujian</SheetTitle>
          <SheetDescription>
            Buat sesi ujian baru untuk mengelola hasil LJK.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-6 px-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="exam-name">Nama Ujian</Label>
              <Input
                id="exam-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Ulangan Tengah Semester 2 2026"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="exam-status">Status Awal</Label>
              <Select
                value={formData.status}
                onValueChange={(val) => setFormData({ ...formData, status: val as ExamStatus })}
              >
                <SelectTrigger id="exam-status">
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="closed">Selesai / Ditutup</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <SheetFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Tambah Sesi
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
