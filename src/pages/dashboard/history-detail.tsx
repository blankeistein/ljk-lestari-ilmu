import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  FileText,
  Calendar,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Eye,
  ArrowLeft,
  AlertCircle
} from "lucide-react";
import { useAuth } from "@/hooks/auth-context";
import { ExamService } from "@/lib/services/exam-service";
import type { ExamAnswer } from "@/types/exam";
import type { UserExam } from "@/types/user";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export default function ScanHistoryDetailPage() {
  const { examId, gradeId, subjectId } = useParams<{
    examId: string;
    gradeId: string;
    subjectId: string
  }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useAuth();
  const [answers, setAnswers] = useState<ExamAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<ExamAnswer | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const passedExam = location.state?.exam as UserExam | undefined;

  useEffect(() => {
    async function loadAnswers() {
      if (!profile?.uid || !examId || !gradeId || !subjectId) return;

      try {
        setLoading(true);
        const data = await ExamService.getAnswers(examId, {
          uploadedBy: profile.uid,
          gradeId: gradeId,
          subjectId: subjectId
        });

        // Sort by studentNo numerically if possible, otherwise string sort
        const sortedData = [...data].sort((a, b) => {
          const numA = parseInt(a.studentNo);
          const numB = parseInt(b.studentNo);
          if (!isNaN(numA) && !isNaN(numB)) {
            return numA - numB;
          }
          return a.studentNo.localeCompare(b.studentNo);
        });

        setAnswers(sortedData);
      } catch (error) {
        console.error("Error loading scan details:", error);
      } finally {
        setLoading(false);
      }
    }

    loadAnswers();
  }, [profile?.uid, examId, gradeId, subjectId]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="w-fit hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors h-9 px-3"
          onClick={() => navigate("/dashboard/history")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Riwayat
        </Button>

        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight">
            {passedExam ? passedExam.name : "Detail Hasil Scan"}
          </h1>
          <p className="text-muted-foreground text-sm font-medium">
            {passedExam
              ? `${passedExam.subject} • ${passedExam.grade}`
              : "Daftar semua LJK yang telah Anda scan untuk sesi ini."}
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="overflow-hidden border-none bg-muted/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : answers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-3 opacity-40 rounded-xl border border-dashed border-primary/20">
            <AlertCircle className="h-12 w-12" />
            <div className="space-y-1">
              <p className="text-lg font-semibold">Tidak ada data scan</p>
              <p className="text-sm">Silakan lakukan scan untuk melihat hasil.</p>
            </div>
          </div>
        ) : (
          answers.map((answer) => (
            <Card
              key={answer.id}
              className="overflow-hidden group transition-all border-none shadow-sm cursor-pointer hover:bg-primary/5"
              onClick={() => {
                setSelectedAnswer(answer);
                setShowDetail(true);
              }}
            >
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-xl overflow-hidden bg-muted shrink-0">
                    {answer.photoUrl ? (
                      <img
                        src={answer.photoUrl}
                        alt={answer.studentName}
                        className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                        <FileText className="h-6 w-6" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-bold text-sm truncate pr-2">
                        {answer.studentName || "Tanpa Nama"}
                      </p>
                      <p className="text-[10px] font-bold text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                        #{answer.studentNo}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="text-xs font-bold text-emerald-600">{answer.correct}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <XCircle className="h-3.5 w-3.5 text-rose-500" />
                        <span className="text-xs font-bold text-rose-600">{answer.wrong}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MinusCircle className="h-3.5 w-3.5 text-amber-500" />
                        <span className="text-xs font-bold text-amber-600">{answer.blank}</span>
                      </div>
                      <div className="ml-auto text-[10px] text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3 opacity-40" />
                        {formatDate(answer.uploadedAt)}
                      </div>
                    </div>
                  </div>

                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAnswer(answer);
                      setShowDetail(true);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      <Sheet open={showDetail} onOpenChange={setShowDetail}>
        <SheetContent side="bottom" className="data-[side=bottom]:max-h-[90vh] max-w-150 rounded-t-2xl mx-auto overflow-hidden flex flex-col p-0">
          <SheetHeader className="p-6 pb-2">
            <SheetTitle className="text-xl font-bold flex items-center justify-between">
              Detail Lembar Jawaban
            </SheetTitle>
            <SheetDescription>
              {passedExam?.name}
              <br />
              {selectedAnswer?.studentName} - #{selectedAnswer?.studentNo}
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="flex-1 px-6 pb-6 overflow-auto">
            <div className="space-y-6">
              {/* Photo Area */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Foto LJK Original
                </h3>
                <div className="rounded-xl overflow-hidden bg-muted border border-primary/5 aspect-3/4 max-w-80 mx-auto relative">
                  {selectedAnswer?.photoUrl ? (
                    <img
                      src={selectedAnswer.photoUrl}
                      alt="LJK student"
                      className="w-full max-w-80 h-full object-contain"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                      Foto tidak tersedia
                    </div>
                  )}
                </div>
              </div>

              {/* Stats Summary */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 flex flex-col items-center">
                  <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1">Benar</p>
                  <p className="text-xl font-black text-emerald-700">{selectedAnswer?.correct}</p>
                </div>
                <div className="bg-rose-50 p-3 rounded-xl border border-rose-100 flex flex-col items-center">
                  <p className="text-[10px] font-bold text-rose-600 uppercase mb-1">Salah</p>
                  <p className="text-xl font-black text-rose-700">{selectedAnswer?.wrong}</p>
                </div>
                <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 flex flex-col items-center">
                  <p className="text-[10px] font-bold text-amber-600 uppercase mb-1">Kosong</p>
                  <p className="text-xl font-black text-amber-700">{selectedAnswer?.blank}</p>
                </div>
              </div>

              {/* Answers Grid */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Daftar Jawaban
                </h3>
                <div className="grid grid-cols-5 gap-2">
                  {selectedAnswer && Object.entries(selectedAnswer.studentAnswers)
                    .sort(([a], [b]) => parseInt(a) - parseInt(b))
                    .map(([num, data]) => (
                      <div
                        key={num}
                        className={cn(
                          "flex flex-col items-center justify-center p-2 rounded-lg border text-[11px] font-bold transition-colors",
                          data.selected === ""
                            ? "bg-amber-50 border-amber-200 text-amber-700"
                            : data.isCorrect
                              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                              : "bg-rose-50 border-rose-200 text-rose-700"
                        )}
                      >
                        <span className="opacity-60 text-md mb-0.5">{num}</span>
                        <span>{data.selected || "-"}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}
