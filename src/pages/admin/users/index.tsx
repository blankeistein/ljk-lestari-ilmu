import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { UserService } from "@/lib/services/user-service";
import {
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  Search,
  Loader2,
  Trash2,
  Edit,
  Eye,
  Shield,
  ShieldCheck,
  GraduationCap,
  UserCog,
  Plus,
  FileText,
  X,
  School,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { UserEditSheet } from "@/pages/admin/users/components/user-edit-sheet";
import { UserDetailSheet } from "@/pages/admin/users/components/user-detail-sheet";
import { AddUserSheet } from "@/pages/admin/users/components/user-add-sheet";
import type { UserProfile } from "@/types/user";
import { ROLE_LABELS } from "@/types/user";
import { formatDate } from "@/lib/utils";

const LIMIT = 20;

export default function UsersPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const schoolId = searchParams.get("schoolId");

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [hasMore, setHasMore] = useState(true);

  // Sheet State
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  // Delete Dialog State
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchUsers = useCallback(async (isLoadMore = false, startAfterDoc: QueryDocumentSnapshot<DocumentData> | null = null) => {
    setLoading(true);
    try {
      const result = await UserService.fetchUsers({
        limitCount: LIMIT,
        lastVisible: isLoadMore ? startAfterDoc : null,
        searchQuery: searchQuery,
        role: roleFilter,
        schoolId: schoolId || undefined,
      });

      if (isLoadMore) {
        setUsers((prev) => [...prev, ...result.users]);
      } else {
        setUsers(result.users);
      }

      setLastVisible(result.lastVisible);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Gagal memuat data user");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, roleFilter, schoolId]);

  // Initial load and search effect
  useEffect(() => {
    // Immediate load for empty search
    if (!searchQuery) {
      fetchUsers(false, null);
      return;
    }

    const timer = setTimeout(() => {
      // Reset visible cursor when searching
      setLastVisible(null);
      fetchUsers(false, null);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, fetchUsers]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await UserService.deleteUser(deleteId);
      setUsers(users.filter((u) => u.uid !== deleteId));
      toast.success("User berhasil dihapus");
      setDeleteId(null);
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Gagal menghapus user");
    }
  };

  const handleAssignRole = async (targetUid: string, role: string) => {
    try {
      setLoading(true);
      const result = await UserService.assignRole(targetUid, role);
      if (result.success) {
        toast.success(result.message);
        fetchUsers(false); // Refresh list
      }
    } catch (error: unknown) {
      console.error("Error assigning role:", error);
      const errorMessage = error instanceof Error ? error.message : "Gagal mengubah role";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const openEditSheet = (user: UserProfile) => {
    setSelectedUser(user);
    setIsEditSheetOpen(true);
  };

  const openDetailSheet = (user: UserProfile) => {
    setSelectedUser(user);
    setIsDetailSheetOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <Users className="h-8 w-8" />
            Manajemen User
          </h1>
          <p className="text-muted-foreground text-sm">
            Kelola informasi akun dan identitas Anda sebagai administrator sistem.
          </p>
        </div>
        <Button onClick={() => setIsAddSheetOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Tambah User
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari email..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-50">
          <Select value={roleFilter} onValueChange={(val) => {
            setLastVisible(null);
            setRoleFilter(val);
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Filter Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Role</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="teacher">Guru</SelectItem>
              <SelectItem value="headmaster">Kepala Sekolah</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {schoolId && (
          <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20 animate-in fade-in zoom-in-95 duration-200">
            <School className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-primary">School ID: {schoolId}</span>
            <button
              onClick={() => navigate("/admin/users")}
              className="ml-1 p-0.5 hover:bg-primary/20 rounded-full transition-colors"
              title="Clear school filter"
            >
              <X className="h-3.5 w-3.5 text-primary" />
            </button>
          </div>
        )}
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12.5"></TableHead>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>UID</TableHead>
              <TableHead>Terdaftar Pada</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && users.length === 0 ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-8 w-8 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                  Tidak ada data user.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.uid}>
                  <TableCell>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.photoUrl || ""} />
                      <AvatarFallback>{user.name?.substring(0, 2).toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{user.name || "Tanpa Nama"}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.role === "admin" ? "default" : user.role === "teacher" ? "secondary" : "outline"}
                      className={user.role === "headmaster" ? "border-primary text-primary" : ""}
                    >
                      {ROLE_LABELS[user.role] || user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {user.uid}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(user.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => openDetailSheet(user)}>
                          <Eye className="mr-2 h-4 w-4" /> Detail
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditSheet(user)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/admin/users/${user.uid}/ljk`)}>
                          <FileText className="mr-2 h-4 w-4" /> Daftar LJK
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>
                            <UserCog className="mr-2 h-4 w-4" />
                            <span>Assign to Role</span>
                          </DropdownMenuSubTrigger>
                          <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                              <DropdownMenuItem onClick={() => handleAssignRole(user.uid, "admin")}>
                                <Shield className="mr-2 h-4 w-4" />
                                <span>Admin</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAssignRole(user.uid, "headmaster")}>
                                <ShieldCheck className="mr-2 h-4 w-4" />
                                <span>Headmaster</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAssignRole(user.uid, "teacher")}>
                                <GraduationCap className="mr-2 h-4 w-4" />
                                <span>Teacher</span>
                              </DropdownMenuItem>
                            </DropdownMenuSubContent>
                          </DropdownMenuPortal>
                        </DropdownMenuSub>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteId(user.uid)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Hapus
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

      {hasMore && !searchQuery && (
        <div className="flex justify-center py-4">
          <Button
            variant="outline"
            onClick={() => fetchUsers(true, lastVisible)}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memuat...
              </>
            ) : (
              "Muat Lebih Banyak"
            )}
          </Button>
        </div>
      )}

      <UserEditSheet
        isOpen={isEditSheetOpen}
        onOpenChange={setIsEditSheetOpen}
        user={selectedUser}
        onSuccess={() => fetchUsers(false)}
      />

      <UserDetailSheet
        isOpen={isDetailSheetOpen}
        onOpenChange={setIsDetailSheetOpen}
        user={selectedUser}
      />

      <AddUserSheet
        isOpen={isAddSheetOpen}
        onOpenChange={setIsAddSheetOpen}
        onSuccess={() => fetchUsers(false)}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan menghapus data user dari database.
              Akun autentikasi pengguna mungkin masih ada tergantung konfigurasi sistem.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
