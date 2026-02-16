import { Link, useRouteError } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, RefreshCcw, ShieldCheck, ShieldAlert, Loader2 } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { ErrorReportService } from "@/lib/services/error-report-service";

export default function ServerErrorPage() {
  const error = useRouteError() as Error;
  const [reportingStatus, setReportingStatus] = useState<'idle' | 'reporting' | 'success' | 'failed'>('idle');
  const reportedRef = useRef(false);

  useEffect(() => {
    // Only report once per load
    if (reportedRef.current) return;
    reportedRef.current = true;

    const reportError = async () => {
      setReportingStatus('reporting');
      try {
        const reportId = await ErrorReportService.reportError(error || "Unknown Server Error");
        if (reportId) {
          setReportingStatus('success');
        } else {
          setReportingStatus('failed');
        }
      } catch (err) {
        console.error("Error reporting error:", err);
        setReportingStatus('failed');
      }
    };

    reportError();
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
      <div className="relative mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-16 w-16 text-destructive animate-bounce" />
        <div className="absolute -right-2 -top-2 flex h-10 w-10 items-center justify-center rounded-full bg-destructive text-destructive-foreground font-bold border-4 border-background shadow-lg">
          500
        </div>
      </div>

      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4 text-destructive">
        Terjadi Kesalahan Server
      </h1>
      <p className="max-w-md text-muted-foreground mb-6 text-lg">
        Maaf, sepertinya terjadi masalah di server kami. Laporan kesalahan telah dikirimkan secara otomatis untuk membantu kami memperbaikinya.
      </p>

      {reportingStatus !== 'idle' && (
        <div className="flex items-center gap-2 mb-8 px-4 py-2 rounded-full border bg-card text-sm font-medium animate-in fade-in slide-in-from-bottom-2 duration-500">
          {reportingStatus === 'reporting' && (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span>Mengirim laporan error...</span>
            </>
          )}
          {reportingStatus === 'success' && (
            <>
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span className="text-emerald-500">Laporan berhasil terkirim (App Check verified)</span>
            </>
          )}
          {reportingStatus === 'failed' && (
            <>
              <ShieldAlert className="h-4 w-4 text-amber-500" />
              <span className="text-amber-500">Gagal mengirim laporan otomatis</span>
            </>
          )}
        </div>
      )}

      {error?.message && (
        <div className="bg-muted p-4 rounded-xl mb-10 w-full max-w-lg text-left font-mono text-sm overflow-auto border shadow-inner">
          <p className="font-bold text-destructive mb-2 uppercase text-xs tracking-widest flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
            Error Details
          </p>
          <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">{error.message}</p>
          {error.stack && (
            <details className="mt-4 opacity-50 hover:opacity-100 transition-opacity">
              <summary className="cursor-pointer text-xs font-bold hover:underline">Show Stack Trace</summary>
              <pre className="mt-2 text-[10px] overflow-x-auto whitespace-pre p-2 bg-black/5 rounded">
                {error.stack}
              </pre>
            </details>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={() => window.location.reload()} variant="outline" size="lg" className="rounded-full px-8">
          <RefreshCcw className="mr-2 h-4 w-4" />
          Coba Lagi
        </Button>
        <Button asChild size="lg" className="rounded-full px-8 shadow-lg shadow-primary/20">
          <Link to="/">
            <Home className="mr-2 h-4 w-4" />
            Ke Beranda
          </Link>
        </Button>
      </div>

      <div className="mt-16 text-xs text-muted-foreground border-t pt-8 w-full max-w-xs opacity-60">
        <p>© {new Date().getFullYear()} LJK Lestari Ilmu • Sistem Pelaporan Berbasis AI</p>
      </div>
    </div>
  );
}
