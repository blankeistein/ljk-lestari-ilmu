import { useState, useEffect, useCallback } from "react";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  Search,
  Loader2,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { UserDetailSheet } from "@/pages/admin/users/components/user-detail-sheet";
import type { UserProfile } from "@/types/user";
import { ROLE_LABELS } from "@/types/user";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

const LIMIT = 20;

export default function HeadmasterStaffPage() {
  const { profile } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [hasMore, setHasMore] = useState(true);

  // Sheet State
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  const fetchUsers = useCallback(async (isLoadMore = false, startAfterDoc: QueryDocumentSnapshot<DocumentData> | null = null) => {
    if (!profile?.schoolId) return;

    setLoading(true);
    try {
      const result = await UserService.fetchUsers({
        limitCount: LIMIT,
        lastVisible: isLoadMore ? startAfterDoc : null,
        searchQuery: searchQuery,
        schoolId: profile.schoolId,
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
      toast.error("Gagal memuat data staf");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, profile?.schoolId]);

  // Initial load and search effect
  useEffect(() => {
    if (!profile?.schoolId) return;

    if (!searchQuery) {
      fetchUsers(false, null);
      return;
    }

    const timer = setTimeout(() => {
      setLastVisible(null);
      fetchUsers(false, null);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, fetchUsers, profile?.schoolId]);

  const openDetailSheet = (user: UserProfile) => {
    setSelectedUser(user);
    setIsDetailSheetOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Daftar Guru & Staf</h1>
        <p className="text-muted-foreground">
          Kelola dan lihat informasi seluruh guru dan kepala sekolah di instansi Anda.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari berdasarkan email..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-md bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12.5"></TableHead>
              <TableHead>Nama & Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Terdaftar</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && users.length === 0 ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                  Tidak ada data guru atau kepala sekolah ditemukan.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.uid}>
                  <TableCell>
                    <Avatar className="h-8 w-8 border">
                      <AvatarImage src={user.photoUrl || ""} />
                      <AvatarFallback className="text-[10px] font-bold">
                        {user.name?.substring(0, 2).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{user.name || "Tanpa Nama"}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.role === "headmaster" ? "default" : "secondary"}
                      className="text-[10px]"
                    >
                      {ROLE_LABELS[user.role] || user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(user.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Opsi</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => openDetailSheet(user)}>
                          <Eye className="mr-2 h-4 w-4" /> Detail Profil
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
            size="sm"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memuat...
              </>
            ) : (
              "Muat Staf Lainnya"
            )}
          </Button>
        </div>
      )}

      <UserDetailSheet
        isOpen={isDetailSheetOpen}
        onOpenChange={setIsDetailSheetOpen}
        user={selectedUser}
      />
    </div>
  );
}
