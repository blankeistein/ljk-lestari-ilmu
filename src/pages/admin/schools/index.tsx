import { useState, useEffect, useCallback, useRef } from "react";
import { type DocumentData, type QueryDocumentSnapshot } from "firebase/firestore";
import {
  School as SchoolIcon,
  MapPin,
  Search,
  MoreVertical,
  Plus,
  SlidersHorizontal,
  X,
  Download,
  ChartBar,
  Pencil,
} from "lucide-react";
import type { School, Province, Regency, District } from "@/types/school";
import { SchoolService } from "@/lib/services/school-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { EditSchoolSheet } from "./components/edit-school-sheet";
import { AddSchoolSheet } from "./components/add-school-sheet";
import { ExportSchoolsSheet } from "./components/export-schools-sheet";
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
import { Trash2, Loader2 } from "lucide-react";

export default function SchoolsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const lastDocRef = useRef<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Filters
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [regencies, setRegencies] = useState<Regency[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);

  const [selectedProvinceId, setSelectedProvinceId] = useState<number>(0);
  const [selectedRegencyId, setSelectedRegencyId] = useState<number>(0);
  const [selectedDistrictId, setSelectedDistrictId] = useState<number>(0);

  const [tempProvinceId, setTempProvinceId] = useState<number>(0);
  const [tempRegencyId, setTempRegencyId] = useState<number>(0);
  const [tempDistrictId, setTempDistrictId] = useState<number>(0);

  const [searchTerm, setSearchTerm] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Edit & Add State
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [isExportSheetOpen, setIsExportSheetOpen] = useState(false);

  // Deletion State
  const [deletingSchool, setDeletingSchool] = useState<School | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchSchools = useCallback(async (isLoadMore = false) => {
    if (isLoadMore) {
      setIsLoadingMore(true);
    } else {
      setLoading(true);
      lastDocRef.current = null;
    }

    try {
      const { schools: newSchools, lastVisible } = await SchoolService.getSchools({
        provinceId: selectedProvinceId,
        regencyId: selectedRegencyId,
        districtId: selectedDistrictId,
        search: searchTerm,
        lastVisible: isLoadMore ? (lastDocRef.current || undefined) : undefined,
        limitCount: 20
      });

      if (isLoadMore) {
        setSchools(prev => [...prev, ...newSchools]);
      } else {
        setSchools(newSchools);
      }

      lastDocRef.current = lastVisible || null;
      setHasMore(newSchools.length === 20);
    } catch (error) {
      console.error("Error fetching schools:", error);
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  }, [selectedProvinceId, selectedRegencyId, selectedDistrictId, searchTerm]);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const data = await SchoolService.getProvinces();
        setProvinces(data);
      } catch (error) {
        console.error("Error fetching provinces:", error);
      }
    };
    fetchProvinces();
  }, []);

  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

  useEffect(() => {
    // Clear downstream filters immediately
    setRegencies([]);
    setDistricts([]);
    setTempRegencyId(0);
    setTempDistrictId(0);

    if (tempProvinceId && tempProvinceId !== 0) {
      const fetchRegencies = async () => {
        try {
          const data = await SchoolService.getRegencies(tempProvinceId);
          setRegencies(data || []);
        } catch (error) {
          console.error("Error fetching regencies:", error);
          setRegencies([]);
        }
      };
      fetchRegencies();
    }
  }, [tempProvinceId]);

  useEffect(() => {
    // Clear downstream filters immediately
    setDistricts([]);
    setTempDistrictId(0);

    if (tempRegencyId && tempRegencyId !== 0) {
      const fetchDistricts = async () => {
        try {
          const data = await SchoolService.getDistricts(tempRegencyId);
          setDistricts(data || []);
        } catch (error) {
          console.error("Error fetching districts:", error);
          setDistricts([]);
        }
      };
      fetchDistricts();
    }
  }, [tempRegencyId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSchools();
  };

  const resetFilters = () => {
    setTempProvinceId(0);
    setTempRegencyId(0);
    setTempDistrictId(0);
    setSelectedProvinceId(0);
    setSelectedRegencyId(0);
    setSelectedDistrictId(0);
    setSearchTerm("");
    setIsSheetOpen(false);
  };

  const handleApplyFilter = () => {
    setSelectedProvinceId(tempProvinceId);
    setSelectedRegencyId(tempRegencyId);
    setSelectedDistrictId(tempDistrictId);
    setIsSheetOpen(false);
  };

  const handleEditSuccess = () => {
    fetchSchools();
  };

  const handleDelete = async () => {
    if (!deletingSchool) return;
    setIsDeleting(true);
    try {
      await SchoolService.deleteSchool(deletingSchool.id);
      setIsDeleteConfirmOpen(false);
      setDeletingSchool(null);
      fetchSchools(false);
    } catch (error) {
      console.error("Error deleting school:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Daftar Sekolah</h1>
          <p className="text-muted-foreground">
            Manajemen data sekolah, wilayah, dan instansi pendidikan.
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <Button variant="outline" onClick={() => setIsExportSheetOpen(true)}>
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          <Button onClick={() => setIsAddSheetOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Tambah Sekolah
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-2">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <form onSubmit={handleSearch}>
            <Input
              placeholder="Cari nama sekolah..."
              className="pl-9 h-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </form>
        </div>

        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="h-10 gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filter Wilayah
              {(selectedProvinceId !== 0 || selectedRegencyId !== 0 || selectedDistrictId !== 0) && (
                <Badge variant="secondary" className="px-1 h-5 min-w-5 flex items-center justify-center rounded-full text-[10px]">
                  {[selectedProvinceId, selectedRegencyId, selectedDistrictId].filter(Boolean).length}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filter Wilayah</SheetTitle>
              <SheetDescription>
                Saring data sekolah berdasarkan lokasi administratif.
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-6 py-6 px-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Provinsi</label>
                <Select
                  value={tempProvinceId === 0 ? "none" : tempProvinceId.toString()}
                  onValueChange={(val) => setTempProvinceId(val === "none" ? 0 : Number(val))}
                >
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue placeholder="Semua Provinsi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Semua Provinsi</SelectItem>
                    {provinces.map((p) => (
                      <SelectItem key={p.id} value={p.id.toString()}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Kabupaten</label>
                <Select
                  value={tempRegencyId === 0 ? "none" : tempRegencyId.toString()}
                  onValueChange={(val) => setTempRegencyId(val === "none" ? 0 : Number(val))}
                  disabled={tempProvinceId === 0 || regencies.length === 0}
                >
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue placeholder={
                      tempProvinceId === 0
                        ? "Pilih Provinsi terlebih dahulu"
                        : regencies.length === 0
                          ? "Memuat data..."
                          : "Pilih Kabupaten"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Semua Kabupaten</SelectItem>
                    {regencies.map((r) => (
                      <SelectItem key={r.id} value={r.id.toString()}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Kecamatan</label>
                <Select
                  value={tempDistrictId === 0 ? "none" : tempDistrictId.toString()}
                  onValueChange={(val) => setTempDistrictId(val === "none" ? 0 : Number(val))}
                  disabled={tempRegencyId === 0 || districts.length === 0}
                >
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue placeholder={
                      tempRegencyId === 0
                        ? "Pilih Kabupaten terlebih dahulu"
                        : districts.length === 0
                          ? "Memuat data..."
                          : "Pilih Kecamatan"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Semua Kecamatan</SelectItem>
                    {districts.map((d) => (
                      <SelectItem key={d.id} value={d.id.toString()}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <SheetFooter className="flex-col gap-2 sm:flex-col">
              <Button onClick={handleApplyFilter} className="w-full">
                Terapkan Filter
              </Button>
              <SheetClose asChild>
                <Button variant="ghost" className="w-full gap-2" onClick={resetFilters}>
                  <X className="h-4 w-4" /> Reset Filter
                </Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-75">Nama Sekolah</TableHead>
              <TableHead>Wilayah</TableHead>
              <TableHead>Alamat</TableHead>
              <TableHead className="w-25 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-50" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-37.5" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-62.5" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : schools.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <SchoolIcon className="h-12 w-12 mb-4 opacity-20" />
                    <p className="text-lg font-medium">Tidak ada sekolah ditemukan</p>
                    <p className="text-sm">Coba sesuaikan filter atau kata kunci pencarian Anda.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              schools.map((school) => (
                <TableRow key={school.id} className="group hover:bg-muted/30">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <SchoolIcon className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="truncate">{school.name}</span>
                        <span className="text-xs text-muted-foreground font-normal">ID: {school.id}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <MapPin className="mr-1 h-3 w-3" />
                        {school.province}
                      </div>
                      <div className="flex items-center text-sm font-medium">
                        {school.regency}
                      </div>
                      <Badge variant="outline" className="w-fit text-[10px] h-4 font-normal">
                        Kec. {school.district}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-muted-foreground line-clamp-2 max-w-75">
                      {school.address || ""}
                    </p>
                  </TableCell>
                  <TableCell className="text-right">
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
                            setEditingSchool(school);
                            setIsEditSheetOpen(true);
                          }}
                        >
                          <Pencil className="mr-1 h-4 w-4" />
                          Edit Detail
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                          <ChartBar className="mr-1 h-4 w-4" />
                          Lihat Statistik
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="cursor-pointer text-destructive focus:text-destructive"
                          onClick={() => {
                            setDeletingSchool(school);
                            setIsDeleteConfirmOpen(true);
                          }}
                        >
                          <Trash2 className="mr-1 h-4 w-4" />
                          Hapus Sekolah
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

      {!loading && schools.length > 0 && (
        <div className="flex flex-col items-center gap-4 py-4">
          <p className="text-sm text-muted-foreground">
            Menampilkan {schools.length} sekolah
          </p>
          {hasMore && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchSchools(true)}
              disabled={isLoadingMore}
              className="min-w-32"
            >
              {isLoadingMore ? "Memuat..." : "Muat Lebih Banyak"}
            </Button>
          )}
        </div>
      )}

      <EditSchoolSheet
        school={editingSchool}
        open={isEditSheetOpen}
        onOpenChange={setIsEditSheetOpen}
        onSuccess={handleEditSuccess}
      />

      <AddSchoolSheet
        open={isAddSheetOpen}
        onOpenChange={setIsAddSheetOpen}
        onSuccess={handleEditSuccess}
      />

      <ExportSchoolsSheet
        open={isExportSheetOpen}
        onOpenChange={setIsExportSheetOpen}
      />

      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus data sekolah
              <span className="font-semibold text-foreground"> {deletingSchool?.name}</span> secara permanen dari sistem.
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
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menghapus...
                </>
              ) : (
                "Hapus"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
