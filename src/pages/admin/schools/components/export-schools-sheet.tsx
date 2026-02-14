import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SchoolService } from "@/lib/services/school-service";
import type { Province, Regency, District } from "@/types/school";
import { Loader2, Download } from "lucide-react";

interface ExportSchoolsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExportSchoolsSheet({
  open,
  onOpenChange,
}: ExportSchoolsSheetProps) {
  const [loading, setLoading] = useState(false);
  const [fetchingRegions, setFetchingRegions] = useState(false);

  // Form State
  const [filters, setFilters] = useState({
    provinceId: 0,
    regencyId: 0,
    districtId: 0,
  });

  // Regions State
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [regencies, setRegencies] = useState<Regency[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const data = await SchoolService.getProvinces();
        setProvinces(data);
      } catch (error) {
        console.error("Error fetching provinces:", error);
      }
    };
    if (open) {
      fetchProvinces();
    }
  }, [open]);

  const handleProvinceChange = async (val: string) => {
    const value = val === "-" ? 0 : Number(val);
    setFilters(prev => ({ ...prev, provinceId: value, regencyId: 0, districtId: 0 }));
    setRegencies([]);
    setDistricts([]);

    if (value && value !== 0) {
      setFetchingRegions(true);
      try {
        const data = await SchoolService.getRegencies(value);
        setRegencies(data);
      } catch (error) {
        console.error("Error fetching regencies:", error);
      } finally {
        setFetchingRegions(false);
      }
    }
  };

  const handleRegencyChange = async (val: string) => {
    const value = val === "-" ? 0 : Number(val);
    setFilters(prev => ({ ...prev, regencyId: value, districtId: 0 }));
    setDistricts([]);

    if (value && value !== 0) {
      setFetchingRegions(true);
      try {
        const data = await SchoolService.getDistricts(value);
        setDistricts(data);
      } catch (error) {
        console.error("Error fetching districts:", error);
      } finally {
        setFetchingRegions(false);
      }
    }
  };

  const handleDistrictChange = (val: string) => {
    const value = val === "-" ? 0 : Number(val);
    setFilters(prev => ({ ...prev, districtId: value }));
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      const schools = await SchoolService.getAllSchools(filters);

      if (schools.length === 0) {
        alert("Tidak ada data sekolah untuk kriteria yang dipilih.");
        return;
      }

      // Generate CSV
      const headers = ["ID", "Nama Sekolah", "Alamat", "Provinsi", "Kabupaten", "Kecamatan"];
      const csvData = schools.map(s => [
        s.id,
        s.name,
        s.address || "",
        s.province || "",
        s.regency || "",
        s.district || ""
      ]);

      const csvContent = [
        headers.join(","),
        ...csvData.map(row => row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);

      const districtName = districts.find(d => d.id === filters.districtId)?.name || "Wilayah";
      link.setAttribute("download", `Data_Sekolah_${districtName.replace(/\s+/g, '_')}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      onOpenChange(false);
    } catch (error) {
      console.error("Error exporting schools:", error);
      alert("Gagal mengekspor data sekolah.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-135 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Export Data Sekolah</SheetTitle>
          <SheetDescription>
            Pilih wilayah hingga tingkat Kecamatan untuk mengekspor data sekolah ke file CSV.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6 px-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Provinsi</Label>
              <Select
                value={filters.provinceId === 0 ? "-" : filters.provinceId.toString()}
                onValueChange={handleProvinceChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Provinsi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-">Semua Provinsi</SelectItem>
                  {provinces.map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Kabupaten/Kota</Label>
              <Select
                value={filters.regencyId === 0 ? "-" : filters.regencyId.toString()}
                onValueChange={handleRegencyChange}
                disabled={filters.provinceId === 0 || (regencies.length === 0 && !fetchingRegions)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    fetchingRegions
                      ? "Memuat..."
                      : filters.provinceId === 0
                        ? "Pilih provinsi dahulu"
                        : "Pilih Kabupaten"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {regencies.map((r) => (
                    <SelectItem key={r.id} value={r.id.toString()}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Kecamatan</Label>
              <Select
                value={filters.districtId === 0 ? "-" : filters.districtId.toString()}
                onValueChange={handleDistrictChange}
                disabled={filters.regencyId === 0 || (districts.length === 0 && !fetchingRegions)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    fetchingRegions
                      ? "Memuat..."
                      : filters.regencyId === 0
                        ? "Pilih kabupaten dahulu"
                        : "Pilih Kecamatan"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {districts.map((d) => (
                    <SelectItem key={d.id} value={d.id.toString()}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <SheetFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button onClick={handleExport} disabled={loading || filters.districtId === 0}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Export CSV
            </Button>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}
