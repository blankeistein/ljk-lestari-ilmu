import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Layers,
  FileText,
  Users,
  BarChart,
  Loader2,
  AlertCircle
} from "lucide-react";
import { ExamService } from "@/lib/services/exam-service";
import type { Exam, Grade, Subject, GradeSubjectStats } from "@/types/exam";
import { useAuth } from "@/hooks/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  ResponsiveContainer,
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";


export default function HeadmasterReportDetailPage() {
  const { examId } = useParams<{ examId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { profile } = useAuth();

  const gradeId = searchParams.get("gradeId");
  const subjectId = searchParams.get("subjectId");

  const [exam, setExam] = useState<Exam | null>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [stats, setStats] = useState<GradeSubjectStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!examId) return;
    setLoading(true);
    try {
      // Always fetch exam detail if not already present
      if (!exam) {
        const examData = await ExamService.getExamById(examId);
        setExam(examData);
      }

      // Always fetch grades if we need to show dropdowns (gradeId and subjectId exist)
      // or if we are at the top level selection
      if (!gradeId || (gradeId && subjectId)) {
        const gradesData = await ExamService.getGrades(examId);
        setGrades(gradesData);
      }

      if (gradeId) {
        // Fetch subjects for current grade (needed for dropdown or selection)
        const subjectsData = await ExamService.getSubjects(examId, gradeId);
        setSubjects(subjectsData);

        if (subjectId && profile?.schoolId) {
          // Fetch detailed stats
          const statsData = await ExamService.getGradeSubjectStats(
            examId,
            profile.schoolId,
            gradeId,
            subjectId
          );
          setStats(statsData);
        }
      }
    } catch (error) {
      console.error("Error fetching report details:", error);
    } finally {
      setLoading(false);
    }
  }, [examId, gradeId, subjectId, profile?.schoolId, exam]);

  useEffect(() => {
    if (examId) {
      fetchData();
    }
  }, [examId, gradeId, subjectId, profile?.schoolId, fetchData]);

  const handleGoBack = () => {
    navigate("/headmaster/reports");
  };

  const selectGrade = (id: string) => {
    setSearchParams({ gradeId: id });
  };

  const selectSubject = (id: string) => {
    if (gradeId) {
      setSearchParams({ gradeId, subjectId: id });
    }
  };

  if (loading && !exam) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Button
          variant="ghost"
          className="w-fit -ml-4 gap-2 text-muted-foreground hover:text-primary"
          onClick={handleGoBack}
        >
          <ChevronLeft className="size-4" />
          {/* {subjectId ? "Kembali ke Daftar Mata Pelajaran" : gradeId ? "Kembali ke Daftar Kelas" : "Kembali ke Laporan"} */}
          Kembali ke Laporan
        </Button>

        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight">{exam?.name}</h1>
          {
            !subjectId ? (
              <h5 className="font-semibold text-muted-foreground">Pilih Kelas</h5>
            ) : !gradeId ? (
              <h5 className="font-semibold text-muted-foreground">Pilih Mata Pelajaran</h5>
            ) : (
              <h5 className="font-semibold text-muted-foreground">Analasis Ujian</h5>
            )
          }
        </div>
      </div>

      {/* Main Content */}
      {!gradeId ? (
        /* GRADE SELECTION */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)
            ) : grades.length === 0 ? (
              <div className="col-span-full text-center p-12 bg-muted/20 rounded-3xl border border-dashed text-muted-foreground">
                Tidak ada data kelas ditemukan.
              </div>
            ) : (
              grades.map((grade) => (
                <Card
                  key={grade.id}
                  className="group hover:ring-2 hover:ring-primary/20 transition-all cursor-pointer border-none shadow-md overflow-hidden"
                  onClick={() => selectGrade(grade.id)}
                >
                  <CardContent className="p-6 flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-primary/60 uppercase tracking-widest">Tingkat</p>
                      <h3 className="text-2xl font-black">{grade.name}</h3>
                    </div>
                    <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <Layers className="size-6" />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      ) : !subjectId ? (
        /* SUBJECT SELECTION */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)
            ) : subjects.length === 0 ? (
              <div className="col-span-full text-center p-12 bg-muted/20 rounded-3xl border border-dashed text-muted-foreground">
                Tidak ada data mata pelajaran ditemukan untuk kelas ini.
              </div>
            ) : (
              subjects.map((subject) => (
                <Card
                  key={subject.id}
                  className="group border-none shadow-lg hover:shadow-xl transition-all cursor-pointer relative overflow-hidden"
                  onClick={() => selectSubject(subject.id)}
                >
                  <div className="absolute top-0 right-0 p-8 transform translate-x-4 -translate-y-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <FileText className="size-24" />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl font-bold uppercase tracking-tight">{subject.name}</CardTitle>
                    <CardDescription>Mata Pelajaran</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 pt-2">
                      <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase">
                        {subject.layout} Soal
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <BarChart className="size-3" />
                        Lihat Statistik
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      ) : (
        /* DETAILED STATS */
        <div className="space-y-8 animate-in zoom-in-95 duration-300">
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-muted/30 p-4 rounded-3xl border border-primary/5">
            <div className="flex items-center gap-2">
              <Layers className="size-4 text-primary" />
              <Select value={gradeId || ""} onValueChange={selectGrade}>
                <SelectTrigger className="bg-background border-none shadow-sm rounded-xl">
                  <SelectValue placeholder="Pilih Kelas" />
                </SelectTrigger>
                <SelectContent>
                  {grades.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="size-4 text-primary" />
              <Select value={subjectId || ""} onValueChange={selectSubject}>
                <SelectTrigger className="bg-background border-none shadow-sm rounded-xl uppercase font-bold">
                  <SelectValue placeholder="Pilih Mata Pelajaran" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id} className="uppercase font-medium">
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {loading ? (
            <div className="space-y-8">
              <Skeleton className="h-40 rounded-3xl" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Skeleton className="h-80 rounded-3xl" />
                <Skeleton className="h-80 rounded-3xl" />
              </div>
            </div>
          ) : !stats ? (
            <div className="h-80 flex flex-col items-center justify-center bg-muted/20 rounded-3xl border border-dashed border-primary/20 text-muted-foreground">
              <AlertCircle className="size-12 mb-4 opacity-20" />
              <p className="text-xl font-semibold opacity-50">Data Belum Tersedia</p>
              <p className="text-sm opacity-40">Belum ada hasil LJK yang diproses untuk kelas dan mata pelajaran ini.</p>
              <Button onClick={handleGoBack} variant="outline" className="mt-6 rounded-full">
                Pilih Mata Pelajaran Lain
              </Button>
            </div>
          ) : (
            <>
              {/* Summary Hero */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-none shadow-md bg-primary text-primary-foreground">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-widest opacity-80">Total Peserta</span>
                      <Users className="size-4 opacity-80" />
                    </div>
                    <h3 className="text-3xl font-black">{stats.totalAnswer}</h3>
                    <p className="text-xs mt-1 opacity-70 italic">Siswa terdeteksi</p>
                  </CardContent>
                </Card>
                {/* Add more summary cards if needed */}
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 gap-8">
                <Card className="border-none shadow-xl ring-1 ring-primary/5">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold">Analisis per Nomor Soal</CardTitle>
                    <CardDescription>
                      Distribusi tingkat akurasi (Benar/Salah/Kosong) untuk setiap nomor soal.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="h-100 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <ReBarChart
                          data={Object.entries(stats.detail).map(([id, s]) => ({
                            name: `No ${id}`,
                            Benar: s.correct || 0,
                            Salah: s.incorrect || 0,
                            Kosong: s.blank || 0,
                          }))}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                          <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10 }}
                            interval={0}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                          />
                          <YAxis axisLine={false} tickLine={false} hide />
                          <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          />
                          <Legend iconType="circle" />
                          <Bar dataKey="Benar" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                          <Bar dataKey="Salah" stackId="a" fill="#ef4444" radius={[0, 0, 0, 0]} />
                          <Bar dataKey="Kosong" stackId="a" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                        </ReBarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Detail Table */}
                <Card className="border-none shadow-xl ring-1 ring-primary/5">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold">Detail Jawaban Siswa</CardTitle>
                    <CardDescription>
                      Frekuensi pemilihan opsi jawaban oleh seluruh peserta.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-xl border border-muted-foreground/10 overflow-hidden">
                      <Table>
                        <TableHeader className="bg-muted/50">
                          <TableRow>
                            <TableHead className="w-20">Soal</TableHead>
                            <TableHead className="min-w-50">Akurasi (B/S/K)</TableHead>
                            <TableHead className="w-32">Kesulitan</TableHead>
                            <TableHead>Distribusi Opsi (A/B/C/D/E)</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {Object.entries(stats.detail).map(([id, s]) => {
                            const correctAnswer = subjects.find(sub => sub.id === subjectId)?.answerKey?.[id];

                            const total = (s.correct || 0) + (s.incorrect || 0) + (s.blank || 0);
                            const correctPct = total > 0 ? ((s.correct || 0) / total) * 100 : 0;
                            const incorrectPct = total > 0 ? ((s.incorrect || 0) / total) * 100 : 0;
                            const blankPct = total > 0 ? ((s.blank || 0) / total) * 100 : 0;

                            let difficulty = "Cukup Sulit";
                            let difficultyColor = "bg-orange-100 text-orange-700";

                            if (correctPct >= 70) {
                              difficulty = "Mudah";
                              difficultyColor = "bg-green-100 text-green-700";
                            } else if (correctPct < 30) {
                              difficulty = "Sulit";
                              difficultyColor = "bg-red-100 text-red-700";
                            }

                            return (
                              <TableRow key={id} className="hover:bg-primary/2">
                                <TableCell className="font-bold"># {id}</TableCell>
                                <TableCell>
                                  <div className="space-y-1.5">
                                    <div className="flex justify-between text-[10px] font-bold">
                                      <span className="text-green-600 inline-block">{s.correct || 0}B</span>
                                      <span className="text-red-500 inline-block">{s.incorrect || 0}S</span>
                                      <span className="text-slate-400 inline-block">{s.blank || 0}K</span>
                                    </div>
                                    <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
                                      <div
                                        className="bg-green-500 transition-all"
                                        style={{ width: `${correctPct}%` }}
                                        title={`Benar: ${correctPct.toFixed(1)}%`}
                                      />
                                      <div
                                        className="bg-red-500 transition-all"
                                        style={{ width: `${incorrectPct}%` }}
                                        title={`Salah: ${incorrectPct.toFixed(1)}%`}
                                      />
                                      <div
                                        className="bg-slate-300 transition-all"
                                        style={{ width: `${blankPct}%` }}
                                        title={`Kosong: ${blankPct.toFixed(1)}%`}
                                      />
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge className={`border-none shadow-none font-bold text-[10px] px-2 py-0 ${difficultyColor}`}>
                                    {difficulty}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    {['A', 'B', 'C', 'D'].map(choice => {
                                      const isCorrect = choice === correctAnswer;
                                      return (
                                        <div key={choice} className="flex flex-col items-center">
                                          <span className={`text-[10px] font-bold ${isCorrect ? 'text-green-600 underline' : 'text-muted-foreground'}`}>
                                            {choice}
                                          </span>
                                          <Badge
                                            variant={isCorrect ? "default" : "outline"}
                                            className={`text-[10px] font-mono h-6 ${isCorrect ? 'bg-green-600 hover:bg-green-700 border-none px-1' : 'px-1'}`}
                                          >
                                            {s.choices?.[choice] || 0}
                                          </Badge>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
