import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileQuestion, Home, MoveLeft } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
      <div className="relative mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-muted">
        <FileQuestion className="h-16 w-16 text-muted-foreground animate-pulse" />
        <div className="absolute -right-2 -top-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold border-4 border-background">
          404
        </div>
      </div>

      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
        Halaman Tidak Ditemukan
      </h1>
      <p className="max-w-125 text-muted-foreground mb-10 text-lg">
        Maaf, kami tidak dapat menemukan halaman yang Anda cari. Mungkin tautan yang Anda klik sudah tidak berlaku atau ada kesalahan penulisan URL.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild variant="outline" size="lg">
          <Link to={-1 as any}>
            <MoveLeft className="mr-2 h-4 w-4" />
            Kembali
          </Link>
        </Button>
        <Button asChild size="lg">
          <Link to="/">
            <Home className="mr-2 h-4 w-4" />
            Beranda
          </Link>
        </Button>
      </div>

      <div className="mt-16 text-sm text-muted-foreground border-t pt-8 w-full max-w-xs">
        <p>© {new Date().getFullYear()} LJK Lestari Ilmu</p>
      </div>
    </div>
  );
}
