import { useState, useEffect } from "react";
import {
  FileText,
  Search,
  Calendar,
  ChevronRight,
  XCircle,
  RefreshCcw,
  BarChart3
} from "lucide-react";
import type { Exam } from "@/types/exam";
import { ExamService } from "@/lib/services/exam-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function HeadmasterReportsPage() {
  const navigate = useNavigate();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "closed">("all");

  const fetchExams = async () => {
    setLoading(true);
    try {
      // Limit 20 as requested
      const data = await ExamService.getReportExams(20);
      setExams(data);
    } catch (error) {
      console.error("Error fetching report exams:", error);
      toast.error("Gagal memuat laporan ujian");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const filteredExams = exams.filter((exam) => {
    const matchesSearch = exam.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || exam.status === filterStatus;
    return matchesSearch && matchesStatus;
  });


  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <BarChart3 className="size-5" />
            <span className="text-sm font-bold uppercase tracking-widest">Analytics</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">
            Laporan Ujian
          </h1>
          <p className="text-muted-foreground text-lg">
            Pantau ringkasan hasil ujian yang sedang berjalan maupun yang telah selesai.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchExams}
          disabled={loading}
          className="rounded-full gap-2 border-primary/20 hover:bg-primary/5 transition-all"
        >
          <RefreshCcw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
          Segarkan Data
        </Button>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama laporan ujian..."
            className="pl-10 h-11 bg-background shadow-sm border-primary/10 focus-visible:ring-primary/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center bg-muted/50 p-1 rounded-lg border gap-1">
          <Button
            variant={filterStatus === "all" ? "secondary" : "ghost"}
            size="sm"
            className="h-9 rounded-md text-xs font-semibold px-4"
            onClick={() => setFilterStatus("all")}
          >
            Semua
          </Button>
          <Button
            variant={filterStatus === "active" ? "secondary" : "ghost"}
            size="sm"
            className="h-9 rounded-md text-xs font-semibold px-4"
            onClick={() => setFilterStatus("active")}
          >
            Aktif
          </Button>
          <Button
            variant={filterStatus === "closed" ? "secondary" : "ghost"}
            size="sm"
            className="h-9 rounded-md text-xs font-semibold px-4"
            onClick={() => setFilterStatus("closed")}
          >
            Selesai
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border-none shadow-sm ring-1 ring-primary/5">
              <CardHeader className="space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))
        ) : filteredExams.length === 0 ? (
          <div className="col-span-full h-80 flex flex-col items-center justify-center text-muted-foreground bg-muted/20 rounded-3xl border border-dashed border-primary/20">
            <FileText className="size-16 mb-4 opacity-10" />
            <p className="text-xl font-semibold opacity-50">Laporan tidak ditemukan</p>
            <p className="text-sm opacity-40">Belum ada ujian yang berstatus Aktif atau Selesai.</p>
          </div>
        ) : (
          filteredExams.map((exam) => (
            <Card
              key={exam.id}
              className="group border-none shadow-md hover:shadow-xl ring-1 ring-primary/5 hover:ring-primary/20 transition-all duration-300 cursor-pointer overflow-hidden p-0"
              onClick={() => navigate(`/headmaster/reports/${exam.id}`)}
            >
              <div className={`h-2 ${exam.status === 'active' ? 'bg-green-500' : 'bg-orange-400'}`} />
              <CardHeader className="space-y-1 mt-2 px-6">
                <div className="flex items-center justify-between mb-2">
                  <Badge
                    variant={exam.status === 'active' ? 'default' : 'secondary'}
                    className={`rounded-full px-3 py-1 font-bold tracking-tighter uppercase text-[10px] shadow-sm ${exam.status === 'active' ? 'bg-green-500 hover:bg-green-600' : ''
                      }`}
                  >
                    {exam.status === 'active' ? (
                      <span className="flex items-center gap-1.5">
                        <span className="size-1.5 rounded-full bg-white animate-pulse" />
                        Live
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <XCircle className="size-3" />
                        Closed
                      </span>
                    )}
                  </Badge>
                  <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded uppercase">
                    ID: {exam.id.substring(0, 8)}
                  </span>
                </div>
                <CardTitle className="text-xl font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                  {exam.name}
                </CardTitle>
                <div className="flex items-center text-sm text-muted-foreground gap-2 pt-2">
                  <Calendar className="size-3.5" />
                  {exam.createdAt
                    ? new Intl.DateTimeFormat("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }).format(exam.createdAt.toDate())
                    : "-"}
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6 pt-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-primary/3 border border-primary/10 group-hover:bg-primary/6 transition-colors">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase tracking-widest text-primary/60">Lihat Detail</span>
                    <span className="text-sm font-medium">Analisis & Hasil</span>
                  </div>
                  <div className="size-10 rounded-full bg-white shadow-sm flex items-center justify-center text-primary group-hover:translate-x-1 transition-transform">
                    <ChevronRight className="size-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
