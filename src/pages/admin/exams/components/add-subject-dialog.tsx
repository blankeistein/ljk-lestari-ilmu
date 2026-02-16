import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { toast } from "sonner";
import type { SubjectLayout } from "@/types/exam";

interface AddSubjectDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  examsId: string;
  gradeId: string | null;
}

export function AddSubjectDialog({
  isOpen,
  onOpenChange,
  examsId,
  gradeId,
}: AddSubjectDialogProps) {
  const [data, setData] = useState({
    id: "",
    name: "",
    layout: "35" as SubjectLayout,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examsId || !gradeId) return;
    if (!data.id || !data.name) {
      toast.error("ID dan Nama mata pelajaran harus diisi");
      return;
    }

    setLoading(true);
    try {
      // Generate default answer key based on layout
      const answerKey: Record<string, string> = {};
      const count = parseInt(data.layout);
      for (let i = 1; i <= count; i++) {
        answerKey[i.toString()] = "A";
      }

      await ExamService.createSubject(examsId, gradeId, {
        id: data.id.toLowerCase().replace(/\s+/g, "-"),
        name: data.name,
        layout: data.layout,
        answerKey,
      });
      toast.success("Mata pelajaran berhasil ditambahkan");
      onOpenChange(false);
      setData({ id: "", name: "", layout: "35" });
    } catch (error) {
      console.error("Error adding subject:", error);
      toast.error("Gagal menambahkan mata pelajaran");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Mata Pelajaran</DialogTitle>
          <DialogDescription>
            Tentukan mata pelajaran dan layout LJK (jumlah soal).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="subject-name">Nama Mata Pelajaran</Label>
            <Input
              id="subject-name"
              value={data.name}
              onChange={(e) =>
                setData({
                  ...data,
                  name: e.target.value,
                  id: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                })
              }
              placeholder="Contoh: Matematika"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject-id">ID Pelajaran (Slug)</Label>
            <Input
              id="subject-id"
              value={data.id}
              onChange={(e) => setData({ ...data, id: e.target.value })}
              placeholder="Contoh: matematika"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject-layout">Layout LJK (Jumlah Soal)</Label>
            <Select
              value={data.layout}
              onValueChange={(val) => setData({ ...data, layout: val as SubjectLayout })}
            >
              <SelectTrigger id="subject-layout">
                <SelectValue placeholder="Pilih Layout" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="20">20 Soal</SelectItem>
                <SelectItem value="25">25 Soal</SelectItem>
                <SelectItem value="30">30 Soal</SelectItem>
                <SelectItem value="35">35 Soal</SelectItem>
                <SelectItem value="50">50 Soal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
