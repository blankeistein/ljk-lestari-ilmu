import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Camera,
  Save,
  Loader2,
  Trash2,
  Mail,
  ShieldCheck,
  Building2,
  Calendar,
  KeyRound
} from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useProfile } from "@/hooks/use-profile";
import { ROLE_LABELS } from "@/types/user";
import { useState, useEffect } from "react";
import { SchoolService } from "@/lib/services/school-service";
import { formatDate } from "@/lib/utils";

export default function ProfilePage() {
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

  const [schoolName, setSchoolName] = useState<string>("");
  const [isSchoolLoading, setIsSchoolLoading] = useState(false);

  useEffect(() => {
    async function fetchSchool() {
      if (profile?.schoolId) {
        try {
          setIsSchoolLoading(true);
          const school = await SchoolService.getSchoolById(profile.schoolId);
          setSchoolName(school.name);
        } catch (error) {
          console.error("Error fetching school:", error);
        } finally {
          setIsSchoolLoading(false);
        }
      }
    }
    fetchSchool();
  }, [profile?.schoolId]);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
          <User className="h-8 w-8" />
          Profil Pengguna
        </h1>
        <p className="text-muted-foreground text-sm">
          Kelola informasi identitas dan detail akun Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - User Info Card */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="overflow-hidden border-none shadow-xl ring-1 ring-primary/10">
            <CardContent className="relative pt-0 flex flex-col items-center">
              <div className="group relative">
                <Avatar className="size-32 rounded-2xl shadow-2xl transition-transform group-hover:scale-105 duration-300">
                  <AvatarImage src={photoUrl || ""} alt={name} className="object-cover" />
                  <AvatarFallback className="text-3xl font-bold bg-primary text-primary-foreground">
                    {name?.substring(0, 2).toUpperCase() || "US"}
                  </AvatarFallback>
                </Avatar>
                <label
                  htmlFor="avatar-upload"
                  className="absolute -bottom-2 -right-2 p-2 bg-primary text-primary-foreground rounded-xl shadow-lg cursor-pointer hover:bg-primary/90 transition-all hover:scale-110 active:scale-95"
                >
                  {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <Camera className="size-3.5" />}
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

              {photoUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full mt-6 text-xs text-destructive hover:bg-destructive/5 font-semibold"
                  onClick={handleDeletePhoto}
                  disabled={uploading || loading}
                >
                  <Trash2 className="size-3.5 mr-2" />
                  Hapus Foto Profil
                </Button>
              )}

              <div className="mt-6 text-center space-y-2">
                <h2 className="text-xl font-bold tracking-tight">{name || "User"}</h2>
                <div className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20 uppercase tracking-tighter">
                  <ShieldCheck className="size-3" />
                  {ROLE_LABELS[profile?.role || "user"]}
                </div>
              </div>

              <div className="w-full mt-6 pt-6 border-t space-y-4">
                <div className="flex items-center gap-3 text-sm text-muted-foreground group">
                  <Mail className="size-4 shrink-0" />
                  <span className="truncate">{profile?.email}</span>
                </div>
                {profile?.schoolId && (
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Building2 className="size-4 shrink-0" />
                    <span className="truncate">{isSchoolLoading ? "Memuat..." : schoolName}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Calendar className="size-4 shrink-0" />
                  <span>
                    Terdaftar: {profile?.createdAt ? formatDate(profile.createdAt) : "Baru saja"}
                  </span>
                </div>
              </div>

            </CardContent>
          </Card>

          <Card className="border-none shadow-lg ring-1 ring-primary/5 bg-linear-to-br from-primary/5 to-transparent">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <KeyRound className="size-4 text-primary" />
                Keamanan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Ingin mengubah kata sandi? Silakan gunakan fitur "Lupa Password" pada halaman login atau hubungi admin sekolah.
              </p>
              <Button variant="outline" size="sm" className="w-full text-xs font-bold border-primary/10" disabled>
                Ganti Password
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Edit Form */}
        <Card className="lg:col-span-2 border-none shadow-xl ring-1 ring-primary/10 h-fit">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Detail Informasi</CardTitle>
            <CardDescription>
              Pastikan nama yang Anda gunakan sesuai dengan identitas resmi sekolah untuk mempermudah administrasi.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="name">
                    Nama Lengkap
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupAddon>
                      <User className="size-4" />
                    </InputGroupAddon>
                    <InputGroupInput
                      id="name"
                      placeholder="Masukkan nama lengkap Anda"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={loading || uploading}
                      required
                    />
                  </InputGroup>
                </Field>

                <Field>
                  <FieldLabel htmlFor="email">
                    Alamat Email (Permanen)
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupAddon>
                      <Mail className="size-4" />
                    </InputGroupAddon>
                    <InputGroupInput
                      id="email"
                      value={profile?.email || ""}
                      disabled
                    />
                  </InputGroup>
                </Field>

                <Field>
                  <FieldLabel htmlFor="school">
                    Unit Kerja / Sekolah
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupAddon>
                      <Building2 className="size-4" />
                    </InputGroupAddon>
                    <InputGroupInput
                      id="school"
                      value={isSchoolLoading ? "Memuat data sekolah..." : schoolName || "Sekolah belum terhubung"}
                      disabled
                    />
                  </InputGroup>
                  <p className="text-[10px] text-muted-foreground italic mt-1 font-medium">
                    * Perubahan unit kerja hanya dapat dilakukan oleh Admin atau Kepala Sekolah.
                  </p>
                </Field>
              </FieldGroup>

              <div className="flex justify-end pt-8 border-t">
                <Button
                  type="submit"
                  size="lg"
                  disabled={loading || uploading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <Save className="size-4" />
                      Simpan Profil
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
