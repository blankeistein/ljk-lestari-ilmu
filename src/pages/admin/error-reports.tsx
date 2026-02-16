import { useState, useEffect, useCallback, useRef } from "react";
import {
  AlertCircle,
  Search,
  RefreshCcw,
  ExternalLink,
  ChevronRight,
  User,
  Globe,
  Clock,
  Terminal,
  ShieldAlert,
  Loader2,
  Circle,
  Activity,
  CheckCircle2,
} from "lucide-react";
import { ErrorReportService } from "@/lib/services/error-report-service";
import type { ErrorReport } from "@/types/error-report";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function ErrorReportsPage() {
  const [reports, setReports] = useState<ErrorReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("unresolved");
  const [selectedReport, setSelectedReport] = useState<ErrorReport | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const lastVisibleRef = useRef<unknown>(null);

  const fetchReports = useCallback(async (isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setReports([]);
      lastVisibleRef.current = null;
      setHasMore(true);
    }

    try {
      const { reports: newReports, lastDoc } = await ErrorReportService.fetchReports(20, isLoadMore ? lastVisibleRef.current : undefined);

      setReports(prev => isLoadMore ? [...prev, ...newReports] : newReports);
      lastVisibleRef.current = lastDoc;
      setHasMore(newReports.length === 20);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleUpdateStatus = async (reportId: string, newStatus: ErrorReport['status']) => {
    setIsUpdating(true);
    try {
      await ErrorReportService.updateReportStatus(reportId, newStatus);
      // Update local state
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: newStatus } : r));
      if (selectedReport?.id === reportId) {
        setSelectedReport(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusConfig = (status: ErrorReport['status']) => {
    switch (status) {
      case 'resolved':
        return {
          label: "Selesai",
          icon: CheckCircle2,
          class: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
        };
      case 'investigating':
        return {
          label: "Diteliti",
          icon: Activity,
          class: "bg-amber-500/10 text-amber-500 border-amber-500/20"
        };
      default:
        return {
          label: "Pending",
          icon: Circle,
          class: "bg-destructive/10 text-destructive border-destructive/20"
        };
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.url.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ? true :
        statusFilter === "unresolved" ? (report.status === "pending" || report.status === "investigating") :
          report.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatDate = (timestamp: unknown) => {
    if (!timestamp) return "-";
    try {
      const date = (timestamp as { toDate?: () => Date }).toDate
        ? (timestamp as { toDate: () => Date }).toDate()
        : new Date(timestamp as string | number);
      return format(date, "dd MMM yyyy, HH:mm", { locale: id });
    } catch {
      return "-";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Laporan Error</h1>
          <p className="text-muted-foreground">
            Pantau kesalahan teknis yang terjadi pada aplikasi secara real-time.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {import.meta.env.DEV && (
            <Button
              variant="destructive"
              className="rounded-full shadow-lg shadow-destructive/20"
              onClick={async () => {
                const testError = new Error("Ini adalah pesan error percobaan untuk pengujian sistem.");
                testError.stack = "Error: Test Error\n    at ErrorReportsPage.tsx:Test\n    at React.Component";
                await ErrorReportService.reportError(testError, { test_mode: true, priority: 'critical' });
                fetchReports(false);
              }}
            >
              <ShieldAlert className="mr-2 h-4 w-4" />
              Test Report Error
            </Button>
          )}
          <Button onClick={() => fetchReports(false)} disabled={loading} variant="outline" className="rounded-full">
            <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari pesan error, email user, atau URL..."
            className="pl-9 h-11 rounded-xl shadow-sm border-muted-foreground/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-45 h-11 rounded-xl shadow-sm border-muted-foreground/20">
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-2">
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="unresolved">Belum Selesai</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="investigating">Diteliti</SelectItem>
            <SelectItem value="resolved">Selesai</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border bg-card shadow-lg overflow-hidden transition-all duration-300">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-50">Waktu</TableHead>
              <TableHead>Pesan Error</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>User / Lokasi</TableHead>
              <TableHead className="w-25 text-right">Detail</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-64" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 ml-auto rounded-full" /></TableCell>
                </TableRow>
              ))
            ) : filteredReports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <ShieldAlert className="h-16 w-16 mb-4 opacity-10" />
                    <p className="text-lg font-medium">Tidak ada laporan error</p>
                    <p className="text-sm">Bagus! Aplikasi Anda berjalan dengan lancar.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredReports.map((report) => {
                const statusCfg = getStatusConfig(report.status);
                return (
                  <TableRow
                    key={report.id}
                    className="group hover:bg-muted/40 cursor-pointer transition-colors"
                    onClick={() => setSelectedReport(report)}
                  >
                    <TableCell className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {formatDate(report.timestamp)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 max-w-md">
                        <span className="font-semibold text-destructive line-clamp-1">{report.message}</span>
                        <span className="text-[11px] font-mono text-muted-foreground line-clamp-1 opacity-70">
                          {report.id}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusCfg.class}`}>
                        <statusCfg.icon className="h-3 w-3" />
                        {statusCfg.label}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-sm">
                          <User className="h-3 w-3 text-primary" />
                          <span className="font-medium truncate max-w-37.5">
                            {report.userEmail || "Anonymous"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Globe className="h-3 w-3" />
                          <span className="truncate max-w-50">{new URL(report.url).pathname}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="rounded-full group-hover:bg-primary/10 group-hover:text-primary transition-all">
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {hasMore && filteredReports.length > 0 && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={() => fetchReports(true)}
            disabled={loadingMore}
            className="rounded-full px-8 shadow-sm hover:shadow-md transition-all h-10"
          >
            {loadingMore ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memuat...
              </>
            ) : (
              "Muat Lebih Banyak"
            )}
          </Button>
        </div>
      )}

      <Sheet open={!!selectedReport} onOpenChange={(open) => !open && setSelectedReport(null)}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader className="mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-2">
              <AlertCircle className="h-6 w-6" />
            </div>
            <SheetTitle className="text-2xl font-bold text-destructive">Detail Laporan Error</SheetTitle>
            <SheetDescription>
              ID: {selectedReport?.id}
            </SheetDescription>
          </SheetHeader>

          {selectedReport && (
            <div className="space-y-8 pb-10 px-4">
              {/* Status Update Block */}
              <div className="space-y-3 p-4 rounded-2xl bg-muted/50 border shadow-sm">
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Status</h4>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isUpdating}
                      className={`w-full justify-between rounded-xl h-11 border-2 transition-all ${getStatusConfig(selectedReport.status).class}`}
                    >
                      <div className="flex items-center gap-2">
                        {isUpdating ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          (() => {
                            const config = getStatusConfig(selectedReport.status);
                            const Icon = config.icon;
                            return <Icon className="h-4 w-4" />;
                          })()
                        )}
                        <span className="font-bold">{getStatusConfig(selectedReport.status).label}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 rotate-90 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-(--radix-dropdown-menu-trigger-width) rounded-xl p-2 shadow-xl border-2">
                    {(['pending', 'investigating', 'resolved'] as const).map((s) => {
                      const cfg = getStatusConfig(s);
                      const Icon = cfg.icon;
                      const isActive = selectedReport.status === s;
                      return (
                        <DropdownMenuItem
                          key={s}
                          onClick={() => handleUpdateStatus(selectedReport.id!, s)}
                          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors mb-1 last:mb-0 ${isActive ? cfg.class : 'hover:bg-muted'}`}
                        >
                          <Icon className={`h-4 w-4 ${isActive ? '' : 'opacity-50'}`} />
                          <div className="flex flex-col">
                            <span className="font-bold text-sm">{cfg.label}</span>
                          </div>
                          {isActive && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-current" />}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Message Block */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Pesan Kesalahan</h4>
                <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/10 font-mono text-sm leading-relaxed text-destructive-foreground dark:text-destructive">
                  {selectedReport.message}
                </div>
              </div>

              {/* Context Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Waktu Kejadian</h4>
                  <p className="text-sm font-medium">{formatDate(selectedReport.timestamp)}</p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Pengguna</h4>
                  <p className="text-sm font-medium truncate">{selectedReport.userEmail || "Anonymous"}</p>
                </div>
                {selectedReport.resolvedAt && (
                  <div className="space-y-1 col-span-2 pt-2 border-t">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Diselesaikan Pada</h4>
                    <p className="text-sm font-medium text-emerald-600">{formatDate(selectedReport.resolvedAt)}</p>
                  </div>
                )}
              </div>

              {/* URL Section */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Halaman (URL)</h4>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted text-xs">
                  <Globe className="h-4 w-4 shrink-0 opacity-50" />
                  <span className="truncate flex-1">{selectedReport.url}</span>
                  <a href={selectedReport.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>

              {/* Stack Trace */}
              {selectedReport.stack && (
                <div className="space-y-2">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Terminal className="h-4 w-4" />
                    Stack Trace
                  </h4>
                  <div className="p-4 rounded-xl bg-black text-white font-mono text-[10px] overflow-x-auto whitespace-pre max-h-75 shadow-inner border border-white/10">
                    {selectedReport.stack}
                  </div>
                </div>
              )}

              {/* User Agent */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Browser / Client</h4>
                <p className="text-[11px] leading-relaxed opacity-70 p-3 border rounded-lg bg-card shadow-sm">
                  {selectedReport.userAgent}
                </p>
              </div>

              {/* Metadata */}
              {selectedReport.metadata && Object.keys(selectedReport.metadata).length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Metadata Tambahan</h4>
                  <pre className="text-[11px] p-3 border rounded-lg bg-card shadow-sm overflow-auto">
                    {JSON.stringify(selectedReport.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
