import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Textarea } from "@/components/ui/textarea";
import { ExamService } from "@/lib/services/exam-service";
import { toast } from "sonner";
import type { Subject, SubjectLayout } from "@/types/exam";

interface EditSubjectDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  examsId: string;
  gradeId: string;
  subject: Subject | null;
}

export function EditSubjectDialog({
  isOpen,
  onOpenChange,
  examsId,
  gradeId,
  subject,
}: EditSubjectDialogProps) {
  const [data, setData] = useState({
    name: "",
    layout: "35" as SubjectLayout,
    answerKey: {} as Record<string, string>,
  });
  const [jsonInput, setJsonInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (subject) {
      setData({
        name: subject.name,
        layout: subject.layout,
        answerKey: { ...subject.answerKey },
      });
    }
  }, [subject]);

  const handleAnswerChange = (q: string, value: string) => {
    setData((prev) => ({
      ...prev,
      answerKey: {
        ...prev.answerKey,
        [q]: value,
      },
    }));
  };

  const handleImportJSON = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      if (Array.isArray(parsed)) {
        const newKey: Record<string, string> = { ...data.answerKey };
        const count = parseInt(data.layout);

        parsed.forEach((val, index) => {
          if (index < count) {
            newKey[(index + 1).toString()] = val.toString().toUpperCase();
          }
        });

        setData((prev) => ({
          ...prev,
          answerKey: newKey,
        }));
        toast.success(`Berhasil mengimpor ${Math.min(parsed.length, count)} kunci jawaban`);
        setJsonInput("");
      } else {
        toast.error("Format harus berupa Array (contoh: [\"A\", \"B\"])");
      }
    } catch (error) {
      console.error("JSON parse error:", error);
      toast.error("Format JSON tidak valid");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examsId || !gradeId || !subject) return;

    setLoading(true);
    try {
      let finalAnswerKey = { ...data.answerKey };
      const newCount = parseInt(data.layout);
      const currentCount = Object.keys(finalAnswerKey).length;

      if (newCount > currentCount) {
        for (let i = currentCount + 1; i <= newCount; i++) {
          finalAnswerKey[i.toString()] = "A";
        }
      } else if (newCount < currentCount) {
        const updatedKey: Record<string, string> = {};
        for (let i = 1; i <= newCount; i++) {
          updatedKey[i.toString()] = finalAnswerKey[i.toString()] || "A";
        }
        finalAnswerKey = updatedKey;
      }

      await ExamService.updateSubject(examsId, gradeId, subject.id, {
        name: data.name,
        layout: data.layout,
        answerKey: finalAnswerKey,
      });

      toast.success("Mata pelajaran berhasil diperbarui");
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating subject:", error);
      toast.error("Gagal memperbarui mata pelajaran");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Mata Pelajaran</DialogTitle>
          <DialogDescription>
            Perbarui informasi mata pelajaran dan kunci jawaban.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-subject-name">Nama Mata Pelajaran</Label>
              <Input
                id="edit-subject-name"
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
                placeholder="Contoh: Matematika"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-subject-layout">Layout LJK (Jumlah Soal)</Label>
              <Select
                value={data.layout}
                onValueChange={(val) => setData({ ...data, layout: val as SubjectLayout })}
              >
                <SelectTrigger id="edit-subject-layout">
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
          </div>

          <div className="space-y-3 p-3 border rounded-lg bg-muted/30">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Cepat: Impor dari JSON Array</Label>
              <Button
                size="sm"
                variant="secondary"
                className="h-7 text-xs"
                onClick={handleImportJSON}
                type="button"
              >
                Terapkan
              </Button>
            </div>
            <Textarea
              placeholder='Contoh: ["A", "B", "C", "A", "E"]'
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="h-16 text-xs font-mono"
            />
            <p className="text-[10px] text-muted-foreground italic">
              * Urutan array akan disesuaikan dengan nomor soal 1, 2, 3, dst.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Kunci Jawaban</Label>
              <Badge variant="outline">{Object.keys(data.answerKey).length} Soal</Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5 items-center">
              {Object.keys(data.answerKey)
                .sort((a, b) => parseInt(a) - parseInt(b))
                .map((q) => (
                  <div key={q} className="space-y-1 flex items-center flex-col">
                    <Label className="text-[10px] text-center block text-muted-foreground">
                      No. {q}
                    </Label>
                    <Select
                      value={data.answerKey[q]}
                      onValueChange={(val) => handleAnswerChange(q, val)}
                    >
                      <SelectTrigger className="h-8 px-2 text-xs [&>svg]:hidden">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["A", "B", "C", "D", "E"].map((opt) => (
                          <SelectItem key={opt} value={opt} className="text-xs">
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <DialogFooter className="pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
