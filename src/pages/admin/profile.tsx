import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Camera, Save, Loader2, Trash2, Mail, ShieldCheck } from "lucide-react";
import { useAdminProfile } from "@/hooks/use-admin-profile";
import { ROLE_LABELS } from "@/types/user";

export default function AdminProfilePage() {
  const {
    profile,
    name,
    setName,
    photoUrl,
    loading,
    uploading,
    handleDeletePhoto,
    handleFileUpload,
    handleSubmit
  } = useAdminProfile();

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Profil Admin
        </h1>
        <p className="text-muted-foreground text-lg">
          Kelola informasi akun dan identitas Anda sebagai administrator sistem.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Profile Card */}
        <Card className="lg:col-span-1 h-fit overflow-hidden border-none shadow-xl ring-1 ring-primary/10">
          <div className="h-32 bg-linear-to-br from-primary/20 via-primary/10 to-transparent" />
          <CardContent className="relative pt-0 flex flex-col items-center">
            <div className="-mt-16 group relative">
              <Avatar className="size-32 border-4 border-background shadow-2xl transition-transform group-hover:scale-105 duration-300">
                <AvatarImage src={photoUrl || ""} alt={name} className="object-cover" />
                <AvatarFallback className="text-4xl font-bold bg-primary text-primary-foreground transform transition-colors group-hover:bg-primary/90">
                  {name?.substring(0, 2).toUpperCase() || "AD"}
                </AvatarFallback>
              </Avatar>
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-lg cursor-pointer hover:bg-primary/90 transition-all hover:scale-110 active:scale-95"
              >
                {uploading ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading || loading}
                />
              </label>
            </div>

            <div className="mt-6 text-center space-y-1">
              <h2 className="text-2xl font-bold tracking-tight">{name || "Admin User"}</h2>
              <div className="flex items-center justify-center gap-1.5 py-1 px-3 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
                <ShieldCheck className="size-3.5" />
                {ROLE_LABELS[profile?.role || "admin"]}
              </div>
              <p className="text-sm text-muted-foreground mt-2 flex items-center justify-center gap-2">
                <Mail className="size-3.5" />
                {profile?.email}
              </p>
            </div>

            <div className="w-full mt-8 pt-6 border-t space-y-3">
              {photoUrl && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-destructive/20 text-destructive hover:bg-destructive/10 hover:border-destructive/30 transition-all"
                  onClick={handleDeletePhoto}
                  disabled={uploading || loading}
                >
                  <Trash2 className="size-4 mr-2" />
                  Hapus Foto
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right Column - Edit Form */}
        <Card className="lg:col-span-2 border-none shadow-xl ring-1 ring-primary/10">
          <CardHeader>
            <CardTitle className="text-2xl">Detail Akun</CardTitle>
            <CardDescription>
              Perbarui informasi dasar akun Anda. Pastikan informasi yang dimasukkan valid.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <label htmlFor="name" className="text-sm font-semibold tracking-wide text-primary/80 uppercase">
                    Nama Lengkap
                  </label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      id="name"
                      placeholder="Masukkan nama lengkap"
                      className="pl-10 h-12 text-base focus-visible:ring-primary/30 transition-all border-primary/10 hover:border-primary/30"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={loading || uploading}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <label htmlFor="email" className="text-sm font-semibold tracking-wide text-primary/80 uppercase">
                    Alamat Email (Terkunci)
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50" />
                    <Input
                      id="email"
                      value={profile?.email || ""}
                      disabled
                      className="pl-10 h-12 bg-muted/30 font-mono text-sm border-dashed border-primary/10 cursor-not-allowed opacity-70"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground italic px-1">
                    * Email tidak dapat diubah karena merupakan identitas autentikasi utama.
                  </p>
                </div>

                <div className="grid gap-2">
                  <label htmlFor="role" className="text-sm font-semibold tracking-wide text-primary/80 uppercase">
                    Level Hak Akses
                  </label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50" />
                    <Input
                      id="role"
                      value={ROLE_LABELS[profile?.role || "admin"]}
                      disabled
                      className="pl-10 h-12 bg-muted/30 cursor-not-allowed opacity-70 border-primary/10"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-6">
                <Button
                  type="submit"
                  disabled={loading || uploading}
                  className="gap-2 px-8 h-12 text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-0.5 active:translate-y-0"
                >
                  {loading ? (
                    <>
                      <Loader2 className="size-5 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="size-5" />
                      Simpan Perubahan
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
