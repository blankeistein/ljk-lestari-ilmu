import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Scan, BarChart3, Cloud, Zap } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { getDashboardPath } from "@/lib/utils";

export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated, profile } = useAuth();

  const dashboardPath = getDashboardPath(profile?.role);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-8 bg-primary rounded-lg flex items-center justify-center">
              <Scan className="size-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl tracking-tight">Lestari Ilmu LJK</span>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Button onClick={() => navigate(dashboardPath)}>
                Dashboard {profile?.role === "admin" ? "Admin" : profile?.role === "headmaster" ? "Kepala Sekolah" : ""}
              </Button>
            ) : (
              <Button onClick={() => navigate("/login")}>Masuk</Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 pt-16">
        <section className="relative py-24 overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 opacity-30 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px]" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[128px]" />
          </div>

          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-muted/50 text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Zap className="size-4 text-primary fill-primary" />
              <span>Sistem Penilaian Otomatis Generasi Baru</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-8 duration-700">
              Solusi Canggih Penilaian <br /><span className="text-primary">Berbasis LJK</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-12 duration-1000">
              Kelola ujian, koreksi jawaban, dan pantau perkembangan siswa dengan teknologi Optical Mark Recognition yang cepat, akurat, dan mudah digunakan.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-200">
              <Button size="lg" className="h-12 px-8 text-base transition-all hover:scale-105" onClick={() => navigate("/login")}>
                Mulai Sekarang
              </Button>
              <a href="#" className="transition-all hover:scale-105 active:scale-95">
                <img
                  src="/images/google-play-store-eng.svg"
                  alt="Get it on Google Play"
                  className="h-12 w-auto"
                />
              </a>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Mengapa Memilih Lestari Ilmu?</h2>
              <p className="text-muted-foreground max-w-lg mx-auto">Dirancang untuk efisiensi maksimal dalam administrasi sekolah dan pusat bimbingan belajar.</p>
            </div>

            <div className="grid md:grid-row-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Feature 1 */}
              <div className="group p-8 rounded-2xl border bg-card transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Zap className="size-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Koreksi Instan</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Gunakan kamera perangkat atau scanner untuk koreksi jawaban secara otomatis dalam hitungan detik.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group p-8 rounded-2xl border bg-card transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <BarChart3 className="size-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Analisis Detail</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Dapatkan statistik pencapaian siswa, rata-rata kelas, dan analisis soal secara otomatis dan komprehensif.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group p-8 rounded-2xl border bg-card transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Cloud className="size-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Cloud Sync</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Semua data tersimpan aman di cloud, memungkinkan akses dari mana saja dan sinkronisasi antar perangkat.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to action */}
        <section className="py-24 border-y">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto bg-primary rounded-3xl p-8 md:p-16 text-center text-primary-foreground overflow-hidden relative">
              <div className="absolute top-0 right-0 size-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Siap untuk memodernisasi ujian Anda?</h2>
                <p className="text-primary-foreground/80 text-lg mb-10 max-w-xl mx-auto">
                  Bergabunglah dengan ratusan sekolah yang telah beralih ke sistem penilaian otomatis Lestari Ilmu.
                </p>
                <Button variant="secondary" size="lg" className="h-12 px-10 text-base font-semibold transition-transform hover:scale-105" onClick={() => navigate("/login")}>
                  Daftar Sekarang
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="size-6 bg-primary rounded flex items-center justify-center">
                <Scan className="size-3.5 text-primary-foreground" />
              </div>
              <span className="font-bold tracking-tight">Lestari Ilmu LJK</span>
            </div>

            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Lestari Ilmu. Hak Cipta Dilindungi.
            </p>

            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Bantuan</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privasi</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Kontak</a>
              <a href="#" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors border-l pl-6 group">
                <img
                  src="/images/google-play-store-eng.svg"
                  alt="Android App"
                  className="h-5 w-auto grayscale transition-all group-hover:grayscale-0"
                />
                Android App
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
