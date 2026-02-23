import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  History,
  Search,
  FileText,
  Layers,
  Calendar,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import { useAuth } from "@/hooks/auth-context";
import { UserService } from "@/lib/services/user-service";
import type { UserExam } from "@/types/user";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function ScanHistoryPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState<UserExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadHistory() {
      if (!profile?.uid) return;
      try {
        setLoading(true);
        const data = await UserService.fetchUserExams(profile.uid);
        setExams(data);
      } catch (error) {
        console.error("Error loading scan history:", error);
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, [profile?.uid]);

  const filteredExams = exams.filter(exam =>
    exam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exam.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exam.grade.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewAnswers = (exam: UserExam) => {
    navigate(`/dashboard/history/${exam.referenceExamId}/${exam.gradeId}/${exam.subjectId}`, {
      state: { exam }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <History className="h-8 w-8" />
            Riwayat Scan
          </h1>
          <p className="text-muted-foreground text-sm">
            Daftar semua LJK yang telah Anda scan dan proses.
          </p>
        </div>
      </div>

      <Card className="border-none shadow-xl ring-1 ring-primary/5">
        <CardHeader className="pb-3 px-6 pt-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari ujian, mata pelajaran, atau kelas..."
                className="pl-9 bg-muted/50 border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-full border border-primary/5">
              <History className="h-3.5 w-3.5" />
              Total {filteredExams.length} Riwayat
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="w-[40%] pl-6">Ujian & Mata Pelajaran</TableHead>
                  <TableHead>Kelas</TableHead>
                  <TableHead>Waktu Scan</TableHead>
                  <TableHead className="text-right pr-6">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="border-muted-foreground/5">
                      <TableCell className="pl-6">
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-48" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                      </TableCell>
                      <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell className="pr-6"><div className="flex justify-end"><Skeleton className="h-8 w-8 rounded-full" /></div></TableCell>
                    </TableRow>
                  ))
                ) : filteredExams.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3 opacity-40">
                        <AlertCircle className="h-12 w-12" />
                        <div className="space-y-1">
                          <p className="text-lg font-semibold">Tidak ada riwayat</p>
                          <p className="text-sm">Belum ada data scan yang ditemukan.</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredExams.map((exam) => (
                    <TableRow key={exam.id} className="group hover:bg-primary/5 border-muted-foreground/5 transition-colors">
                      <TableCell className="pl-6 pt-4 pb-4">
                        <div className="flex items-start gap-3 cursor-pointer" onClick={() => handleViewAnswers(exam)}>
                          <div className="mt-1 h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div className="space-y-0.5">
                            <p className="font-bold text-sm leading-tight text-foreground group-hover:text-primary transition-colors">
                              {exam.name}
                            </p>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium uppercase tracking-tight">
                              <span>{exam.subject}</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-primary/5 text-primary hover:bg-primary/10 border-none px-2.5 py-0.5 font-bold text-[10px] uppercase">
                          <Layers className="h-3 w-3 mr-1" />
                          {exam.grade}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                          <Calendar className="h-3.5 w-3.5 opacity-40" />
                          {formatDate(exam.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full hover:bg-primary hover:text-white transition-all shadow-none"
                          onClick={() => handleViewAnswers(exam)}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
