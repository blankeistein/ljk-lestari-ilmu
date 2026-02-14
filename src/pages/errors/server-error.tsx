import { Link, useRouteError } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, RefreshCcw } from "lucide-react";

export default function ServerErrorPage() {
  const error = useRouteError() as Error;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
      <div className="relative mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-16 w-16 text-destructive animate-bounce" />
        <div className="absolute -right-2 -top-2 flex h-10 w-10 items-center justify-center rounded-full bg-destructive text-destructive-foreground font-bold border-4 border-background">
          500
        </div>
      </div>

      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4 text-destructive">
        Terjadi Kesalahan Server
      </h1>
      <p className="max-w-125 text-muted-foreground mb-6 text-lg">
        Maaf, sepertinya terjadi masalah di server kami. Kami sedang berusaha memperbaikinya secepat mungkin.
      </p>

      {error?.message && (
        <div className="bg-muted p-4 rounded-md mb-10 w-full max-w-lg text-left font-mono text-sm overflow-auto">
          <p className="font-bold text-destructive mb-1 uppercase text-xs tracking-wider">Error Details:</p>
          <p className="text-muted-foreground">{error.message}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={() => window.location.reload()} variant="outline" size="lg">
          <RefreshCcw className="mr-2 h-4 w-4" />
          Coba Lagi
        </Button>
        <Button asChild size="lg">
          <Link to="/">
            <Home className="mr-2 h-4 w-4" />
            Ke Beranda
          </Link>
        </Button>
      </div>

      <div className="mt-16 text-sm text-muted-foreground border-t pt-8 w-full max-w-xs">
        <p>© {new Date().getFullYear()} LJK Lestari Ilmu</p>
      </div>
    </div>
  );
}
