import { useState, useEffect, useRef } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SchoolService } from "@/lib/services/school-service";
import { Loader2, Download, Upload, CheckCircle2, AlertCircle, FileSpreadsheet } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface ImportSchoolsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface ParsedSchool {
  id: string;
  name: string;
  address: string;
  desa: string;
  district: string;
  districtId: number;
  province: string;
  provinceId: number;
  regency: string;
  regencyId: number;
  status?: "pending" | "processing" | "success" | "error";
  error?: string;
}

export function ImportSchoolsSheet({
  open,
  onOpenChange,
  onSuccess,
}: ImportSchoolsSheetProps) {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<ParsedSchool[]>([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      // Reset state when closed
      setFile(null);
      setData([]);
      setProgress(0);
      setImporting(false);
    }
  }, [open]);

  const downloadTemplate = () => {
    const headers = ["id", "name", "address", "province", "regency", "district", "desa", "provinceId", "regencyId", "districtId"];
    const sample = [
      "SCH001",
      "SD N 1 Merdeka",
      "Jl. Pahlawan No. 123",
      "JAWA BARAT",
      "KOTA BANDUNG",
      "COBLONG",
      "DAGO",
      "32",
      "3273",
      "3273010"
    ];

    // Support both comma and semicolon templates if needed, but standard is comma
    const csvContent = [headers.join(","), sample.join(",")].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "template_import_sekolah.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseCSV(selectedFile);
    }
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
      if (lines.length < 2) {
        toast.error("File CSV kosong atau tidak valid");
        return;
      }

      // Detect delimiter (comma or semicolon)
      const firstLine = lines[0];
      const delimiter = firstLine.includes(";") ? ";" : ",";

      const headers = firstLine.split(delimiter).map(h => h.trim().toLowerCase());
      const rows = lines.slice(1);

      const parsedData: ParsedSchool[] = rows.map((row) => {
        const values = row.split(delimiter).map(v => v.trim());
        const entry: Record<string, string> = {};
        headers.forEach((header, index) => {
          entry[header] = values[index];
        });

        return {
          id: entry.id || "",
          name: entry.name || "",
          address: entry.address || "",
          desa: entry.desa || "",
          district: entry.district || "",
          districtId: Number(entry.districtid) || 0,
          province: entry.province || "",
          provinceId: Number(entry.provinceid) || 0,
          regency: entry.regency || "",
          regencyId: Number(entry.regencyid) || 0,
          status: "pending" as const
        };
      });

      setData(parsedData);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (data.length === 0) return;
    setImporting(true);
    setProgress(0);

    let successCount = 0;
    let failCount = 0;

    const provinceCache: Record<number, string> = {};
    const regencyCache: Record<number, string> = {};
    const districtCache: Record<number, string> = {};

    const updatedData = [...data];

    for (let i = 0; i < updatedData.length; i++) {
      setData(prev => {
        const next = [...prev];
        next[i].status = "processing";
        return next;
      });

      try {
        const row = updatedData[i];

        // Region Lookup logic: Prefer explicit text if provided, fallback to ID lookup
        let provinceName = row.province;
        let regencyName = row.regency;
        let districtName = row.district;

        // If text name is missing but ID is present, perform lookup
        if (!provinceName && row.provinceId) {
          if (!provinceCache[row.provinceId]) {
            const provinces = await SchoolService.getProvinces();
            const p = provinces.find(p => p.id === row.provinceId);
            provinceCache[row.provinceId] = p?.name || "";
          }
          provinceName = provinceCache[row.provinceId];
        }

        if (!regencyName && row.regencyId) {
          if (!regencyCache[row.regencyId]) {
            const regencies = await SchoolService.getRegencies(row.provinceId);
            const r = regencies.find(r => r.id === row.regencyId);
            regencyCache[row.regencyId] = r?.name || "";
          }
          regencyName = regencyCache[row.regencyId];
        }

        if (!districtName && row.districtId) {
          if (!districtCache[row.districtId]) {
            const districts = await SchoolService.getDistricts(row.regencyId);
            const d = districts.find(d => d.id === row.districtId);
            districtCache[row.districtId] = d?.name || "";
          }
          districtName = districtCache[row.districtId];
        }

        await SchoolService.createSchool({
          name: row.name,
          address: row.address,
          desa: row.desa,
          provinceId: row.provinceId,
          province: provinceName,
          regencyId: row.regencyId,
          regency: regencyName,
          districtId: row.districtId,
          district: districtName,
        }, row.id || undefined);

        setData(prev => {
          const next = [...prev];
          next[i].status = "success";
          return next;
        });
        successCount++;
      } catch (error: unknown) {
        console.error("Import error at row", i, error);
        const errorMessage = error instanceof Error ? error.message : "Error tidak diketahui";
        setData(prev => {
          const next = [...prev];
          next[i].status = "error";
          next[i].error = errorMessage;
          return next;
        });
        failCount++;
      }

      setProgress(Math.round(((i + 1) / updatedData.length) * 100));
    }

    setImporting(false);
    toast.success(`Import selesai: ${successCount} sukses, ${failCount} gagal`);
    if (successCount > 0) {
      onSuccess();
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Import Data Sekolah</SheetTitle>
          <SheetDescription>
            Unggah file CSV untuk menambahkan banyak sekolah sekaligus.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6 px-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium text-sm">Template CSV</p>
                  <p className="text-xs text-muted-foreground">Download template untuk format yang benar</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={downloadTemplate}>
                <Download className="mr-2 h-4 w-4" /> Template
              </Button>
            </div>

            <div
              className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-10 w-10 text-muted-foreground" />
              <div className="text-center">
                <p className="font-medium">Klik untuk upload atau drag file</p>
                <p className="text-xs text-muted-foreground">Hanya file .csv yang didukung</p>
              </div>
              <input
                type="file"
                className="hidden"
                ref={fileInputRef}
                accept=".csv"
                onChange={handleFileChange}
              />
              {file && (
                <div className="mt-2 text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> {file.name}
                </div>
              )}
            </div>
          </div>

          {data.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Preview Data ({data.length} baris)</h3>
                {importing && (
                  <div className="flex items-center gap-2 text-sm text-primary animate-pulse">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Memproses...
                  </div>
                )}
              </div>

              {importing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Progres Import</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader className="bg-muted sticky top-0 z-10">
                    <TableRow>
                      <TableHead className="w-24">ID</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead className="w-24">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-mono text-xs">{row.id || "-"}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{row.name}</span>
                            <span className="text-[10px] text-muted-foreground truncate max-w-50">
                              {row.provinceId}-{row.regencyId}-{row.districtId} | {row.address}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {row.status === "pending" && <span className="text-xs text-muted-foreground">Menunggu</span>}
                          {row.status === "processing" && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                          {row.status === "success" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                          {row.status === "error" && (
                            <div className="flex items-center gap-1 text-red-500">
                              <AlertCircle className="h-4 w-4" />
                              <span className="text-[10px] truncate max-w-15" title={row.error}>Err</span>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>

        <SheetFooter className="pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={importing}>
            Batal
          </Button>
          <Button
            disabled={data.length === 0 || importing}
            onClick={handleImport}
            className="min-w-32"
          >
            {importing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Mengimport...
              </>
            ) : (
              "Mulai Import"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
