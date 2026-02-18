import { useState, useEffect } from "react";
import {
  MoreVertical,
  Plus,
  Trash2,
  Pencil,
  BookMarked,
  Layout,
  ChevronDown,
} from "lucide-react";
import { ExamService } from "@/lib/services/exam-service";
import type { Grade, Subject } from "@/types/exam";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface GradeSectionProps {
  grade: Grade;
  examsId: string;
  onAddSubject: () => void;
  onDeleteGrade: () => void;
  onDeleteSubject: (subject: Subject) => void;
  onEditSubject: (subject: Subject) => void;
}

export function GradeSection({
  grade,
  examsId,
  onAddSubject,
  onDeleteGrade,
  onDeleteSubject,
  onEditSubject,
}: GradeSectionProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!isExpanded) return;

    const unsubscribe = ExamService.subscribeSubjects(examsId, grade.id, (data) => {
      setSubjects(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [examsId, grade.id, isExpanded]);

  const toggleExpand = () => {
    if (!isExpanded && subjects.length === 0) {
      setLoading(true);
    }
    setIsExpanded(!isExpanded);
  };

  return (
    <Card className={cn("transition-all duration-200", isExpanded && "ring-1 ring-primary/20")}>
      <CardHeader
        className="flex flex-row items-center justify-between space-y-0 cursor-pointer select-none"
        onClick={toggleExpand}
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-lg bg-primary/5 text-primary transition-transform duration-200",
            isExpanded ? "rotate-0" : "-rotate-90"
          )}>
            <ChevronDown className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              {grade.name}
              {!isExpanded && subjects.length > 0 && (
                <Badge variant="secondary" className="text-[10px] h-4 px-1">
                  {subjects.length}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>Daftar mata pelajaran untuk {grade.name}</CardDescription>
          </div>
        </div>
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Button size="sm" variant="outline" onClick={onAddSubject}>
            <Plus className="mr-2 h-4 w-4" /> Pelajaran
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-destructive focus:text-destructive cursor-pointer"
                onClick={onDeleteGrade}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Hapus Kelas
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="pt-0">
          {loading ? (
            <Skeleton className="h-24 w-full" />
          ) : subjects.length === 0 ? (
            <p className="text-center py-6 text-sm text-muted-foreground italic">
              Belum ada mata pelajaran
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mata Pelajaran</TableHead>
                  <TableHead>Layout</TableHead>
                  <TableHead>Kunci Jawaban</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjects.map((subject) => (
                  <TableRow key={subject.id}>
                    <TableCell className="font-medium text-sm">
                      <div className="flex items-center gap-2">
                        <BookMarked className="h-4 w-4 text-primary opacity-60" />
                        {subject.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="gap-1 font-normal text-[11px]">
                        <Layout className="h-3 w-3" />
                        {subject.layout} Butir
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground truncate max-w-37.5 block font-mono">
                        {Object.entries(subject.answerKey)
                          .slice(0, 5)
                          .map(([q, a]) => `${q}:${a}`)
                          .join(", ")}
                        ...
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => onEditSubject(subject)}
                          >
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive cursor-pointer"
                            onClick={() => onDeleteSubject(subject)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      )}
    </Card>
  );
}
