import { useState, useEffect } from "react";
import { DevService } from "@/lib/services/dev-service";
import { ExamService } from "@/lib/services/exam-service";
import { SchoolService } from "@/lib/services/school-service";
import type { Exam } from "@/types/exam";
import type { School } from "@/types/school";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, FileText, Wrench } from "lucide-react";

export default function DummyAnswerGeneratorPage() {
  const [count, setCount] = useState(10);
  const [examId, setExamId] = useState<string>("");
  const [exams, setExams] = useState<Exam[]>([]);
  const [schoolId, setSchoolId] = useState<string>("");
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingExams, setLoadingExams] = useState(true);
  const [loadingSchools, setLoadingSchools] = useState(true);

  useEffect(() => {
    loadExams();
    loadSchools();
  }, []);

  const loadExams = async () => {
    try {
      const data = await ExamService.getExams();
      setExams(data);
      if (data.length > 0) {
        setExamId(data[0].id);
      }
    } catch (error) {
      console.error("Error loading exams:", error);
      toast.error("Gagal memuat daftar ujian");
    } finally {
      setLoadingExams(false);
    }
  };

  const loadSchools = async () => {
    try {
      const data = await SchoolService.getAllSchools({ districtId: 3520130 });
      setSchools(data);
      if (data.length > 0) {
        setSchoolId(data[0].id);
      }
    } catch (error) {
      console.error("Error loading schools:", error);
      toast.error("Gagal memuat daftar sekolah");
    } finally {
      setLoadingSchools(false);
    }
  };

  const handleGenerate = async () => {
    if (count <= 0 || count > 100) {
      toast.error("Jumlah harus antara 1 dan 100");
      return;
    }
    if (!examId) {
      toast.error("Pilih ujian terlebih dahulu");
      return;
    }
    if (!schoolId) {
      toast.error("Pilih sekolah terlebih dahulu");
      return;
    }

    setLoading(true);
    try {
      await DevService.generateMockAnswers(count, examId, schoolId);
      toast.success(`Berhasil membuat ${count} jawaban dummy`);
    } catch (error) {
      console.error("Error generating answers:", error);
      toast.error(error instanceof Error ? error.message : "Gagal membuat jawaban dummy");
    } finally {
      setLoading(false);
    }
  };

  if (import.meta.env.PROD) {
    return (
      <div className="flex h-96 shrink-0 items-center justify-center rounded-md border border-dashed">
        <div className="mx-auto flex max-w-sm flex-col items-center justify-center text-center">
          <Wrench className="h-10 w-10 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Developer Mode Only</h3>
          <p className="mb-4 mt-2 text-sm text-muted-foreground">
            Halaman ini hanya tersedia dalam mode pengembangan.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dummy Answer Generator</h1>
        <p className="text-muted-foreground">
          Tools untuk membuat data jawaban dummy secara massal untuk keperluan testing.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Generate Jawaban
            </CardTitle>
            <CardDescription>
              Buat jawaban dummy untuk ujian yang dipilih.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="exam">Pilih Ujian</Label>
              {loadingExams ? (
                <div className="text-sm text-muted-foreground">Memuat ujian...</div>
              ) : exams.length === 0 ? (
                <div className="text-sm text-destructive">Belum ada ujian. Silakan buat ujian dulu.</div>
              ) : (
                <Select value={examId} onValueChange={setExamId}>
                  <SelectTrigger id="exam">
                    <SelectValue placeholder="Pilih ujian" />
                  </SelectTrigger>
                  <SelectContent>
                    {exams.map((exam) => (
                      <SelectItem key={exam.id} value={exam.id}>
                        {exam.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="school">Pilih Sekolah</Label>
              {loadingSchools ? (
                <div className="text-sm text-muted-foreground">Memuat sekolah...</div>
              ) : schools.length === 0 ? (
                <div className="text-sm text-destructive">Belum ada sekolah.</div>
              ) : (
                <Select value={schoolId} onValueChange={setSchoolId}>
                  <SelectTrigger id="school">
                    <SelectValue placeholder="Pilih sekolah" />
                  </SelectTrigger>
                  <SelectContent>
                    {schools.map((school) => (
                      <SelectItem key={school.id} value={school.id}>
                        {school.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="count">Jumlah Data (Maks 100)</Label>
              <Input
                id="count"
                type="number"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value))}
                min={1}
                max={100}
              />
            </div>

            <Button
              className="w-full"
              onClick={handleGenerate}
              disabled={loading || loadingExams || exams.length === 0}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Sekarang"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
