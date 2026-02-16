import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FileText,
  ChevronLeft,
  Search,
  Calendar,
  GraduationCap,
  BookOpen,
  ArrowRight,
  ClipboardList,
  Wrench,
  Loader2,
} from "lucide-react";
import { UserService } from "@/lib/services/user-service";
import { ExamService } from "@/lib/services/exam-service";
import { DevService } from "@/lib/services/dev-service";
import { type UserExam, type UserProfile } from "@/types/user";
import { type ExamAnswer } from "@/types/exam";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function UserLJKPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  // User Profile State
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Left Card State
  const [userExams, setUserExams] = useState<UserExam[]>([]);
  const [loadingExams, setLoadingExams] = useState(true);
  const [selectedExam, setSelectedExam] = useState<UserExam | null>(null);

  // Right Card State
  const [answers, setAnswers] = useState<ExamAnswer[]>([]);
  const [loadingAnswers, setLoadingAnswers] = useState(false);

  const fetchUserProfile = useCallback(async () => {
    if (!userId) return;
    try {
      const data = await UserService.getUserById(userId);
      setUserProfile(data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  }, [userId]);

  const fetchUserExams = useCallback(async () => {
    if (!userId) return;
    setLoadingExams(true);
    try {
      const data = await UserService.fetchUserExams(userId);
      setUserExams(data);
    } catch (error) {
      console.error("Error fetching user exams:", error);
      toast.error("Gagal memuat daftar ujian user");
    } finally {
      setLoadingExams(false);
    }
  }, [userId]);

  const fetchAnswers = useCallback(async (exam: UserExam) => {
    if (!userId) return;
    setLoadingAnswers(true);
    try {
      const data = await ExamService.getAnswers(exam.referenceExamId, {
        uploadedBy: userId,
        gradeId: exam.gradeId,
        subjectId: exam.subjectId,
      });
      setAnswers(data);
    } catch (error) {
      console.error("Error fetching answers:", error);
      toast.error("Gagal memuat detail jawaban LJK");
    } finally {
      setLoadingAnswers(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserProfile();
    fetchUserExams();
  }, [fetchUserProfile, fetchUserExams]);

  useEffect(() => {
    if (selectedExam) {
      fetchAnswers(selectedExam);
    } else {
      setAnswers([]);
    }
  }, [selectedExam, fetchAnswers]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/users")}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Riwayat Ujian {userProfile?.name || "User"}
            </h1>
            <p className="text-muted-foreground">
              {userProfile?.email || `User ID: ${userId}`}
            </p>
          </div>
        </div>

        {import.meta.env.DEV && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                if (!userId) return;
                try {
                  setLoadingExams(true);
                  await DevService.generateMockUserExams(userId, 5);
                  toast.success("Berhasil membuat 5 data ujian mock");
                  fetchUserExams();
                } catch (error) {
                  const message = error instanceof Error ? error.message : "Gagal membuat data mock";
                  toast.error(message);
                } finally {
                  setLoadingExams(false);
                }
              }}
              disabled={loadingExams}
            >
              {loadingExams ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wrench className="mr-2 h-4 w-4" />
              )}
              Generate Mock Exams
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-12rem)] min-h-125">
        {/* Left Card: List of User's Exams */}
        <Card className="lg:col-span-4 flex flex-col overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl">Daftar Ujian</CardTitle>
            <CardDescription>Pilih ujian untuk melihat detail pengerjaan</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-0">
            {loadingExams ? (
              <div className="p-4 space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-lg" />
                ))}
              </div>
            ) : userExams.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4 text-center">
                <ClipboardList className="h-12 w-12 mb-4 opacity-20" />
                <p>Belum ada riwayat ujian</p>
              </div>
            ) : (
              <div className="divide-y">
                {userExams.map((exam) => (
                  <button
                    key={exam.id}
                    onClick={() => setSelectedExam(exam)}
                    className={cn(
                      "w-full text-left p-4 transition-all hover:bg-muted/50 flex flex-col gap-1 group relative",
                      selectedExam?.id === exam.id && "bg-primary/5 after:absolute after:left-0 after:top-0 after:bottom-0 after:w-1 after:bg-primary"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className={cn(
                        "font-semibold text-sm line-clamp-2 leading-tight group-hover:text-primary transition-colors",
                        selectedExam?.id === exam.id && "text-primary"
                      )}>
                        {exam.name}
                      </span>
                      {selectedExam?.id === exam.id && (
                        <ArrowRight className="h-4 w-4 text-primary shrink-0" />
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal">
                        <BookOpen className="h-3 w-3 mr-1 opacity-50" />
                        {exam.subject}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-normal">
                        <GraduationCap className="h-3 w-3 mr-1 opacity-50" />
                        {exam.grade}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1.5 mt-3 text-[10px] text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {formatDate(exam.createdAt)}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Card: List of Answer Records (LJK) */}
        <Card className="lg:col-span-8 flex flex-col overflow-hidden">
          <CardHeader>
            <div className="flex flex-row items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-xl truncate">
                  {selectedExam ? "Hasil Pemindaian LJK" : "Pilih Ujian"}
                </CardTitle>
                <CardDescription className="truncate">
                  {selectedExam
                    ? `Menampilkan data untuk ${selectedExam.name}`
                    : "Pilih salah satu ujian di sebelah kiri untuk melihat hasil scan"}
                </CardDescription>
              </div>
              {selectedExam && !loadingAnswers && (
                <div className="flex flex-col items-center gap-2 shrink-0">
                  {import.meta.env.DEV && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-[10px]"
                      onClick={async () => {
                        if (!userId) return;
                        try {
                          setLoadingAnswers(true);
                          await DevService.generateMockAnswers(
                            5,
                            selectedExam.referenceExamId,
                            undefined, // schoolId
                            selectedExam.gradeId,
                            selectedExam.subjectId,
                            userId
                          );
                          toast.success("Berhasil membuat 5 data LJK mock");
                          fetchAnswers(selectedExam);
                        } catch (error) {
                          const message = error instanceof Error ? error.message : "Gagal membuat data mock";
                          toast.error(message);
                        } finally {
                          setLoadingAnswers(false);
                        }
                      }}
                      disabled={loadingAnswers}
                    >
                      <Wrench className="mr-1.5 h-3 w-3" />
                      Generate Mock LJK
                    </Button>
                  )}
                  <Badge variant="outline" className="bg-background">
                    {answers.length} Dokumen
                  </Badge>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-0">
            {!selectedExam ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center bg-muted/5">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
                  <FileText className="h-10 w-10 opacity-20" />
                </div>
                <p className="text-xl font-semibold text-foreground mb-2">Belum ada ujian yang dipilih</p>
                <p className="text-sm max-w-sm mx-auto">
                  Silakan pilih salah satu sesi ujian dari daftar di sebelah kiri untuk memuat detail lembar jawaban (LJK) yang telah diunggah oleh user ini.
                </p>
              </div>
            ) : loadingAnswers ? (
              <div className="p-0">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Siswa</TableHead>
                      <TableHead>No. Peserta</TableHead>
                      <TableHead className="text-center">Nilai</TableHead>
                      <TableHead>Waktu</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24 mx-auto" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : answers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center bg-muted/5">
                <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center mb-6">
                  <Search className="h-10 w-10 text-orange-200" />
                </div>
                <p className="text-xl font-semibold text-foreground mb-2">Tidak ada data scan LJK</p>
                <p className="text-sm max-w-sm mx-auto">
                  User ini belum pernah mengunggah atau melakukan pemindaian lembar jawaban untuk kombinasi ujian, kelas, dan mata pelajaran ini.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-muted/50 sticky top-0 z-10 backdrop-blur-sm">
                  <TableRow>
                    <TableHead>Siswa</TableHead>
                    <TableHead>No. Peserta</TableHead>
                    <TableHead className="text-center">Statistik (B / S / K)</TableHead>
                    <TableHead>Waktu Scan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {answers.map((ans) => (
                    <TableRow key={ans.id} className="hover:bg-muted/20 transition-colors">
                      <TableCell>
                        <span className="font-semibold block">{ans.studentName || "Tanpa Nama"}</span>
                      </TableCell>
                      <TableCell>
                        <code className="text-[11px] bg-muted px-1.5 py-0.5 rounded font-mono">
                          {ans.studentNo || "-"}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-3">
                          <div className="flex flex-col items-center min-w-8">
                            <span className="text-sm font-bold text-green-600">{ans.correct}</span>
                            <span className="text-[8px] uppercase tracking-tighter text-muted-foreground">Benar</span>
                          </div>
                          <div className="h-6 w-px bg-border my-auto" />
                          <div className="flex flex-col items-center min-w-8">
                            <span className="text-sm font-bold text-red-600">{ans.wrong}</span>
                            <span className="text-[8px] uppercase tracking-tighter text-muted-foreground">Salah</span>
                          </div>
                          <div className="h-6 w-px bg-border my-auto" />
                          <div className="flex flex-col items-center min-w-8">
                            <span className="text-sm font-bold text-slate-400">{ans.blank || 0}</span>
                            <span className="text-[8px] uppercase tracking-tighter text-muted-foreground">Kosong</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(ans.uploadedAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
