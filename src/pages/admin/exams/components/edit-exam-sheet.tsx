import { useState, useEffect } from "react";
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
import { type Exam, type ExamStatus } from "@/types/exam";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface EditExamSheetProps {
  exam: Exam | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditExamSheet({
  exam,
  open,
  onOpenChange,
  onSuccess,
}: EditExamSheetProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    status: "draft" as ExamStatus,
  });

  useEffect(() => {
    if (exam) {
      setFormData({
        name: exam.name,
        status: exam.status,
      });
    }
  }, [exam, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exam) return;
    if (!formData.name.trim()) {
      toast.error("Nama ujian harus diisi");
      return;
    }

    setLoading(true);
    try {
      await ExamService.updateExam(exam.id, {
        name: formData.name,
        status: formData.status,
      });

      toast.success("Sesi ujian berhasil diperbarui");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating exam:", error);
      toast.error("Gagal memperbarui sesi ujian");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Edit Sesi Ujian</SheetTitle>
          <SheetDescription>
            Perbarui informasi sesi ujian yang telah dibuat.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-6 px-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-exam-name">Nama Ujian</Label>
              <Input
                id="edit-exam-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Ulangan Tengah Semester 2 2026"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-exam-status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(val) => setFormData({ ...formData, status: val as ExamStatus })}
              >
                <SelectTrigger id="edit-exam-status">
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
              Simpan Perubahan
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
