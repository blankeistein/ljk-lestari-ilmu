import { useState, useEffect } from "react";
import { DevService } from "@/lib/services/dev-service";
import { ExamService } from "@/lib/services/exam-service";
import { SchoolService } from "@/lib/services/school-service";
import { UserService } from "@/lib/services/user-service";
import type { Exam } from "@/types/exam";
import type { School } from "@/types/school";
import type { UserProfile } from "@/types/user";
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
  const [gradeId, setGradeId] = useState<string>("");
  const [subjectId, setSubjectId] = useState<string>("");
  const [exams, setExams] = useState<Exam[]>([]);
  const [grades, setGrades] = useState<import("@/types/exam").Grade[]>([]);
  const [subjects, setSubjects] = useState<import("@/types/exam").Subject[]>([]);
  const [schoolId, setSchoolId] = useState<string>("");
  const [schools, setSchools] = useState<School[]>([]);
  const [teacherId, setTeacherId] = useState<string>("random");
  const [teachers, setTeachers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingExams, setLoadingExams] = useState(true);
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingSchools, setLoadingSchools] = useState(true);
  const [loadingTeachers, setLoadingTeachers] = useState(false);

  useEffect(() => {
    loadExams();
    loadSchools();
  }, []);

  useEffect(() => {
    if (schoolId) {
      loadTeachers(schoolId);
    } else {
      setTeachers([]);
      setTeacherId("random");
    }
  }, [schoolId]);

  useEffect(() => {
    if (examId) {
      loadGrades(examId);
    } else {
      setGrades([]);
      setGradeId("");
    }
  }, [examId]);

  useEffect(() => {
    if (examId && gradeId) {
      loadSubjects(examId, gradeId);
    } else {
      setSubjects([]);
      setSubjectId("");
    }
  }, [examId, gradeId]);

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

  const loadGrades = async (id: string) => {
    setLoadingGrades(true);
    try {
      const data = await ExamService.getGrades(id);
      setGrades(data);
      if (data.length > 0) {
        setGradeId(data[0].id);
      } else {
        setGradeId("");
      }
    } catch (error) {
      console.error("Error loading grades:", error);
    } finally {
      setLoadingGrades(false);
    }
  };

  const loadSubjects = async (eid: string, gid: string) => {
    setLoadingSubjects(true);
    try {
      const data = await ExamService.getSubjects(eid, gid);
      setSubjects(data);
      if (data.length > 0) {
        setSubjectId(data[0].id);
      } else {
        setSubjectId("");
      }
    } catch (error) {
      console.error("Error loading subjects:", error);
    } finally {
      setLoadingSubjects(false);
    }
  };

  const loadSchools = async () => {
    try {
      const data = await SchoolService.getAllSchools({ districtId: 3520060 });
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

  const loadTeachers = async (sid: string) => {
    setLoadingTeachers(true);
    try {
      const data = await UserService.fetchTeachers(sid);
      setTeachers(data);
      setTeacherId("random"); // Reset to random when school changes
    } catch (error) {
      console.error("Error loading teachers:", error);
    } finally {
      setLoadingTeachers(false);
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
    if (!gradeId) {
      toast.error("Pilih kelas terlebih dahulu");
      return;
    }
    if (!subjectId) {
      toast.error("Pilih mata pelajaran terlebih dahulu");
      return;
    }
    if (!schoolId) {
      toast.error("Pilih sekolah terlebih dahulu");
      return;
    }

    setLoading(true);
    try {
      await DevService.generateMockAnswers(count, examId, schoolId, gradeId, subjectId, teacherId);
      toast.success(`Berhasil membuat ${count} jawaban dummy dan riwayat scan`);
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
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
          <Wrench className="h-8 w-8" />
          Dummy Answer Generator
        </h1>
        <p className="text-muted-foreground text-sm">
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
                  <SelectTrigger id="exam" className="w-full">
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
              <Label htmlFor="grade">Pilih Kelas</Label>
              {loadingGrades ? (
                <div className="text-sm text-muted-foreground">Memuat kelas...</div>
              ) : grades.length === 0 ? (
                <div className="text-sm text-destructive">Belum ada kelas untuk ujian ini.</div>
              ) : (
                <Select value={gradeId} onValueChange={setGradeId}>
                  <SelectTrigger id="grade" className="w-full">
                    <SelectValue placeholder="Pilih kelas" />
                  </SelectTrigger>
                  <SelectContent>
                    {grades.map((grade) => (
                      <SelectItem key={grade.id} value={grade.id}>
                        {grade.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Pilih Mata Pelajaran</Label>
              {loadingSubjects ? (
                <div className="text-sm text-muted-foreground">Memuat mata pelajaran...</div>
              ) : subjects.length === 0 ? (
                <div className="text-sm text-destructive">Belum ada mata pelajaran.</div>
              ) : (
                <Select value={subjectId} onValueChange={setSubjectId}>
                  <SelectTrigger id="subject" className="w-full">
                    <SelectValue placeholder="Pilih mata pelajaran" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id} className="uppercase font-medium">
                        {subject.name}
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
                  <SelectTrigger id="school" className="w-full">
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
              <Label htmlFor="teacher">Pilih Guru (Opsional)</Label>
              {loadingTeachers ? (
                <div className="text-sm text-muted-foreground">Memuat guru...</div>
              ) : (
                <Select value={teacherId} onValueChange={setTeacherId}>
                  <SelectTrigger id="teacher" className="w-full">
                    <SelectValue placeholder="Pilih guru" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="random">Acak (Random Guru di Sekolah)</SelectItem>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.uid} value={teacher.uid}>
                        {teacher.name || teacher.email}
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
