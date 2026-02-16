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
import { ExamService } from "@/lib/services/exam-service";
import { toast } from "sonner";

interface AddGradeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  examsId: string;
}

export function AddGradeDialog({ isOpen, onOpenChange, examsId }: AddGradeDialogProps) {
  const [data, setData] = useState({ id: "", name: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.id || !data.name) {
      toast.error("ID dan Nama kelas harus diisi");
      return;
    }

    setLoading(true);
    try {
      await ExamService.createGrade(examsId, {
        id: data.id.toLowerCase().replace(/\s+/g, "-"),
        name: data.name,
      });
      toast.success("Kelas berhasil ditambahkan");
      onOpenChange(false);
      setData({ id: "", name: "" });
    } catch (error) {
      console.error("Error adding grade:", error);
      toast.error("Gagal menambahkan kelas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Kelas Baru</DialogTitle>
          <DialogDescription>
            Masukkan ID dan Nama kelas (misal: "kelas-1", "Kelas 1").
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="grade-name">Nama Kelas</Label>
            <Input
              id="grade-name"
              value={data.name}
              onChange={(e) =>
                setData({
                  ...data,
                  name: e.target.value,
                  id: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                })
              }
              placeholder="Contoh: Kelas 1"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="grade-id">ID Kelas (Slug)</Label>
            <Input
              id="grade-id"
              value={data.id}
              onChange={(e) => setData({ ...data, id: e.target.value })}
              placeholder="Contoh: kelas-1"
              required
            />
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
