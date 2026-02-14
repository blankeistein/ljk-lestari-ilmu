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
import { Input } from "@/components/ui/input";
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
import { Loader2, RefreshCw } from "lucide-react";

interface AddSchoolSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddSchoolSheet({
  open,
  onOpenChange,
  onSuccess,
}: AddSchoolSheetProps) {
  const [loading, setLoading] = useState(false);
  const [fetchingRegions, setFetchingRegions] = useState(false);
  const [schoolId, setSchoolId] = useState("");
  const [idError, setIdError] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    provinceId: 0,
    regencyId: 0,
    districtId: 0,
  });

  // Regions State
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [regencies, setRegencies] = useState<Regency[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);

  const generateId = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setSchoolId(result);
    setIdError("");
  };

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
    setFormData(prev => ({ ...prev, provinceId: value, regencyId: 0, districtId: 0 }));
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
    setFormData(prev => ({ ...prev, regencyId: value, districtId: 0 }));
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
    setFormData(prev => ({ ...prev, districtId: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setIdError("");
    try {
      const province = provinces.find(p => p.id === formData.provinceId)?.name || "";
      const regency = regencies.find(r => r.id === formData.regencyId)?.name || "";
      const district = districts.find(d => d.id === formData.districtId)?.name || "";

      await SchoolService.createSchool({
        name: formData.name,
        address: formData.address,
        desa: "",
        provinceId: formData.provinceId,
        province,
        regencyId: formData.regencyId,
        regency,
        districtId: formData.districtId,
        district,
      }, schoolId || undefined);

      // Reset Form
      setFormData({
        name: "",
        address: "",
        provinceId: 0,
        regencyId: 0,
        districtId: 0,
      });
      setSchoolId("");
      setRegencies([]);
      setDistricts([]);

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating school:", error);
      if (error instanceof Error && error.message === "ID Sekolah sudah digunakan") {
        setIdError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-135 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Tambah Sekolah Baru</SheetTitle>
          <SheetDescription>
            Masukkan informasi schoolId baru and lokasi administratifnya.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-6 px-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="school-id">ID Sekolah (Custom/Auto)</Label>
              <div className="flex gap-2">
                <Input
                  id="school-id"
                  value={schoolId}
                  onChange={(e) => {
                    setSchoolId(e.target.value.toUpperCase());
                    setIdError("");
                  }}
                  placeholder="Contoh: AB12CD"
                  maxLength={20}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={generateId}
                  title="Generate ID"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              {idError && <p className="text-xs text-destructive">{idError}</p>}
              <p className="text-[10px] text-muted-foreground">
                Kosongkan untuk auto-generate oleh sistem (Firebase ID).
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-name">Nama Sekolah</Label>
              <Input
                id="add-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Masukkan nama sekolah"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-address">Alamat</Label>
              <Input
                id="add-address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Masukkan alamat lengkap"
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label>Provinsi</Label>
                <Select
                  value={formData.provinceId === 0 ? "-" : formData.provinceId.toString()}
                  onValueChange={handleProvinceChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Provinsi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-">Pilih Provinsi</SelectItem>
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
                  value={formData.regencyId === 0 ? "-" : formData.regencyId.toString()}
                  onValueChange={handleRegencyChange}
                  disabled={!formData.provinceId || (regencies.length === 0 && !fetchingRegions)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      fetchingRegions
                        ? "Memuat..."
                        : !formData.provinceId
                          ? "Pilih provinsi dahulu"
                          : "Pilih Kabupaten"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-">Pilih Kabupaten</SelectItem>
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
                  value={formData.districtId === 0 ? "-" : formData.districtId.toString()}
                  onValueChange={handleDistrictChange}
                  disabled={!formData.regencyId || (districts.length === 0 && !fetchingRegions)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      fetchingRegions
                        ? "Memuat..."
                        : !formData.regencyId
                          ? "Pilih kabupaten dahulu"
                          : "Pilih Kecamatan"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-">Pilih Kecamatan</SelectItem>
                    {districts.map((d) => (
                      <SelectItem key={d.id} value={d.id.toString()}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <SheetFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Tambah Sekolah
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
