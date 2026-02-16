import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Plus, School } from "lucide-react";
import { ExamService } from "@/lib/services/exam-service";
import type { Exam, Grade, Subject } from "@/types/exam";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

// Sub-components
import { GradeSection } from "./components/grade-section";
import { AddGradeDialog } from "./components/add-grade-dialog";
import { AddSubjectDialog } from "./components/add-subject-dialog";
import { EditSubjectDialog } from "./components/edit-subject-dialog";
import { DeleteConfirmDialog } from "./components/delete-confirm-dialog";

export default function ExamDetailPage() {
  const { examsId } = useParams<{ examsId: string }>();
  const [exam, setExam] = useState<Exam | null>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog Visibility States
  const [isAddGradeOpen, setIsAddGradeOpen] = useState(false);
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [isEditSubjectOpen, setIsEditSubjectOpen] = useState(false);
  const [isDeleteGradeOpen, setIsDeleteGradeOpen] = useState(false);
  const [isDeleteSubjectOpen, setIsDeleteSubjectOpen] = useState(false);

  // Data States for Actions
  const [selectedGradeId, setSelectedGradeId] = useState<string | null>(null);
  const [editingSubject, setEditingSubject] = useState<{ gradeId: string; subject: Subject } | null>(null);
  const [deletingGrade, setDeletingGrade] = useState<Grade | null>(null);
  const [deletingSubject, setDeletingSubject] = useState<{ gradeId: string; subject: Subject } | null>(null);

  // Action Loading States
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!examsId) return;

    // Subscribe to Exam details
    const unsubscribeExam = ExamService.subscribeExam(examsId, (data) => {
      setExam(data);
      setLoading(false);
    });

    // Subscribe to Grades
    const unsubscribeGrades = ExamService.subscribeGrades(examsId, (data) => {
      setGrades(data);
    });

    return () => {
      unsubscribeExam();
      unsubscribeGrades();
    };
  }, [examsId]);

  const handleDeleteGrade = async () => {
    if (!examsId || !deletingGrade) return;
    setIsDeleting(true);
    try {
      await ExamService.deleteGrade(examsId, deletingGrade.id);
      toast.success("Kelas berhasil dihapus");
      setIsDeleteGradeOpen(false);
      setDeletingGrade(null);
    } catch (error) {
      console.error("Error deleting grade:", error);
      toast.error("Gagal menghapus kelas");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteSubject = async () => {
    if (!examsId || !deletingSubject) return;
    setIsDeleting(true);
    try {
      await ExamService.deleteSubject(examsId, deletingSubject.gradeId, deletingSubject.subject.id);
      toast.success("Mata pelajaran berhasil dihapus");
      setIsDeleteSubjectOpen(false);
      setDeletingSubject(null);
    } catch (error) {
      console.error("Error deleting subject:", error);
      toast.error("Gagal menghapus mata pelajaran");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (!exam) return <div>Ujian tidak ditemukan</div>;

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/admin">Admin</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/admin/exams">Ujian</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{exam.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{exam.name}</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            ID: {exam.id} • Status:
            <Badge variant={exam.status === "active" ? "default" : "outline"}>
              {exam.status.toUpperCase()}
            </Badge>
          </p>
        </div>
        <Button onClick={() => setIsAddGradeOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Tambah Kelas
        </Button>
      </div>

      <div className="grid gap-6">
        {grades.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <School className="h-12 w-12 mb-4 opacity-20" />
              <p>Belum ada kelas yang ditambahkan di sesi ini.</p>
              <Button variant="link" onClick={() => setIsAddGradeOpen(true)}>
                Tambah kelas pertama
              </Button>
            </CardContent>
          </Card>
        ) : (
          grades.map((grade) => (
            <GradeSection
              key={grade.id}
              grade={grade}
              examsId={examsId!}
              onAddSubject={() => {
                setSelectedGradeId(grade.id);
                setIsAddSubjectOpen(true);
              }}
              onDeleteGrade={() => {
                setDeletingGrade(grade);
                setIsDeleteGradeOpen(true);
              }}
              onDeleteSubject={(subject) => {
                setDeletingSubject({ gradeId: grade.id, subject });
                setIsDeleteSubjectOpen(true);
              }}
              onEditSubject={(subject) => {
                setEditingSubject({ gradeId: grade.id, subject });
                setIsEditSubjectOpen(true);
              }}
            />
          ))
        )}
      </div>

      {/* Dialog Components */}
      <AddGradeDialog
        isOpen={isAddGradeOpen}
        onOpenChange={setIsAddGradeOpen}
        examsId={examsId!}
      />

      <AddSubjectDialog
        isOpen={isAddSubjectOpen}
        onOpenChange={setIsAddSubjectOpen}
        examsId={examsId!}
        gradeId={selectedGradeId}
      />

      <EditSubjectDialog
        isOpen={isEditSubjectOpen}
        onOpenChange={setIsEditSubjectOpen}
        examsId={examsId!}
        gradeId={editingSubject?.gradeId || ""}
        subject={editingSubject?.subject || null}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteGradeOpen}
        onOpenChange={setIsDeleteGradeOpen}
        onConfirm={handleDeleteGrade}
        title="Hapus Kelas?"
        loading={isDeleting}
        description={
          <>
            Apakah Anda yakin ingin menghapus kelas
            <span className="font-semibold text-foreground"> {deletingGrade?.name}</span>? Semua
            mata pelajaran di dalamnya juga akan terhapus.
          </>
        }
      />

      <DeleteConfirmDialog
        isOpen={isDeleteSubjectOpen}
        onOpenChange={setIsDeleteSubjectOpen}
        onConfirm={handleDeleteSubject}
        title="Hapus Mata Pelajaran?"
        loading={isDeleting}
        description={
          <>
            Apakah Anda yakin ingin menghapus mata pelajaran
            <span className="font-semibold text-foreground"> {deletingSubject?.subject.name}</span>?
          </>
        }
      />
    </div>
  );
}
