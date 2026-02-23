import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Plus,
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  Calendar,
  Layers,
} from "lucide-react";
import type { Exam } from "@/types/exam";
import { ExamService } from "@/lib/services/exam-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { AddExamSheet } from "./components/add-exam-sheet";
import { EditExamSheet } from "./components/edit-exam-sheet";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ExamsPage() {
  const navigate = useNavigate();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);

  // Edit State
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);

  // Deletion State
  const [deletingExam, setDeletingExam] = useState<Exam | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchExams = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ExamService.getExams();
      setExams(data);
    } catch (error) {
      console.error("Error fetching exams:", error);
      toast.error("Gagal memuat data ujian");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  const handleDelete = async () => {
    if (!deletingExam) return;
    setIsDeleting(true);
    try {
      await ExamService.deleteExam(deletingExam.id);
      toast.success("Sesi ujian berhasil dihapus");
      setIsDeleteConfirmOpen(false);
      setDeletingExam(null);
      fetchExams();
    } catch (error) {
      console.error("Error deleting exam:", error);
      toast.error("Gagal menghapus sesi ujian");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredExams = exams.filter((exam) =>
    exam.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500 hover:bg-green-600">Aktif</Badge>;
      case "closed":
        return <Badge variant="secondary">Ditutup</Badge>;
      case "draft":
      default:
        return <Badge variant="outline">Draft</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <BookOpen className="h-8 w-8" />
            Manajemen Ujian
          </h1>
          <p className="text-muted-foreground text-sm">
            Kelola informasi akun dan identitas Anda sebagai administrator sistem.
          </p>
        </div>
        <div>
          <Button onClick={() => setIsAddSheetOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Tambah Sesi Ujian
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama ujian..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[40%]">Nama Ujian</TableHead>
              <TableHead>Dibuat Pada</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-64" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredExams.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <BookOpen className="h-12 w-12 mb-4 opacity-20" />
                    <p className="text-lg font-medium">Tidak ada sesi ujian ditemukan</p>
                    <p className="text-sm">Klik "Tambah Sesi Ujian" untuk memulai.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredExams.map((exam) => (
                <TableRow
                  key={exam.id}
                  className="group hover:bg-muted/30 cursor-pointer"
                  onClick={() => navigate(`/admin/exams/${exam.id}`)}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Layers className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="truncate">{exam.name}</span>
                        <span className="text-xs text-muted-foreground font-normal">ID: {exam.id}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="mr-2 h-4 w-4" />
                      {exam.createdAt
                        ? new Intl.DateTimeFormat("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }).format(exam.createdAt.toDate())
                        : "-"}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(exam.status)}
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => {
                            setEditingExam(exam);
                            setIsEditSheetOpen(true);
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit Detail
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="cursor-pointer text-destructive focus:text-destructive"
                          onClick={() => {
                            setDeletingExam(exam);
                            setIsDeleteConfirmOpen(true);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Hapus Sesi
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AddExamSheet
        open={isAddSheetOpen}
        onOpenChange={setIsAddSheetOpen}
        onSuccess={fetchExams}
      />

      <EditExamSheet
        exam={editingExam}
        open={isEditSheetOpen}
        onOpenChange={setIsEditSheetOpen}
        onSuccess={fetchExams}
      />

      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Sesi Ujian?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Sesi ujian
              <span className="font-semibold text-foreground"> {deletingExam?.name}</span> akan dihapus permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
