import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Camera, Save, Loader2, Trash2 } from "lucide-react";
import { useProfile } from "@/hooks/use-profile";

export default function HeadmasterProfilePage() {
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
  } = useProfile();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profil Saya</h1>
        <p className="text-muted-foreground">Kelola informasi profil Anda sebagai Kepala Sekolah.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Pribadi</CardTitle>
          <CardDescription>
            Perbarui nama dan foto profil Anda secara mandiri.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex flex-col items-center gap-6 mb-6 sm:flex-row sm:items-start">
              <div className="relative">
                <Avatar className="size-32 border-4 border-background shadow-md">
                  <AvatarImage src={photoUrl || ""} alt={name} className="object-cover" />
                  <AvatarFallback className="text-4xl font-bold bg-primary/10 text-primary">
                    {name?.substring(0, 2).toUpperCase() || "KS"}
                  </AvatarFallback>
                </Avatar>
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-full backdrop-blur-[1px]">
                    <Loader2 className="size-10 animate-spin text-primary" />
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-4 text-center sm:text-left">
                <div>
                  <h3 className="text-lg font-semibold tracking-tight">Foto Profil</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Sistem akan otomatis mengoptimalkan foto Anda (1:1, WebP, 500x500px).
                  </p>
                </div>

                <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                  <input
                    type="file"
                    id="avatar-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploading || loading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2 shadow-sm"
                    disabled={uploading || loading}
                    onClick={() => document.getElementById("avatar-upload")?.click()}
                  >
                    {uploading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Camera className="size-4" />
                    )}
                    Ganti Foto
                  </Button>
                  {photoUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-destructive hover:text-destructive hover:bg-destructive/5"
                      onClick={handleDeletePhoto}
                      disabled={uploading || loading}
                    >
                      <Trash2 className="size-4 mr-2" />
                      Hapus
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <FieldGroup className="border-t pt-8">
              <Field>
                <FieldLabel htmlFor="name" className="text-xs uppercase tracking-wider text-muted-foreground">Nama Lengkap</FieldLabel>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="Masukkan nama lengkap"
                    className="pl-10 h-11"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading || uploading}
                    required
                  />
                </div>
              </Field>

              <Field>
                <FieldLabel htmlFor="email" className="text-xs uppercase tracking-wider text-muted-foreground">Email (Read-only)</FieldLabel>
                <Input
                  id="email"
                  value={profile?.email || ""}
                  disabled
                  className="bg-muted/50 font-mono text-sm border-dashed"
                />
              </Field>
            </FieldGroup>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={loading || uploading} className="gap-2 px-10 h-11 shadow-lg shadow-primary/20">
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="size-4" />
                    Simpan Perubahan
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-primary/10 bg-primary/5">
        <CardHeader>
          <CardTitle>Keanggotaan Instansi</CardTitle>
          <CardDescription>
            Berikut adalah identitas sekolah yang terkait dengan profil Anda.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-xl bg-background border shadow-sm">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">Kode Identifikasi Sekolah</p>
              <p className="text-2xl font-mono font-black text-primary tracking-tighter italic">
                {profile?.schoolId || "BELUM_DIATUR"}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10">
              <Save className="size-6 text-primary/40" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
