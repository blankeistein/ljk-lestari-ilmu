import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { User, Camera, Save, Loader2, Trash2, Mail, ShieldCheck } from "lucide-react";
import { useProfile } from "@/hooks/use-profile";
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
  } = useProfile();

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
          <User className="h-8 w-8" />
          Profil
        </h1>
        <p className="text-muted-foreground text-sm">
          Kelola informasi akun dan identitas Anda sebagai administrator sistem.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Profile Card */}
        <Card className="lg:col-span-1 h-fit overflow-hidden border-none shadow-xl ring-1 ring-primary/10">
          <CardContent className="relative pt-0 flex flex-col items-center">
            <div className="group relative">
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

            <div className="w-full mt-4 pt-6 border-t space-y-3">
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
                      placeholder="Masukkan nama lengkap"
                      value={name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                      disabled={loading || uploading}
                      required
                    />
                  </InputGroup>
                </Field>

                <Field>
                  <FieldLabel htmlFor="email">
                    Alamat Email (Terkunci)
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
                  <p className="text-[10px] text-muted-foreground italic mt-1 font-medium">
                    * Email tidak dapat diubah karena merupakan identitas autentikasi utama.
                  </p>
                </Field>

                <Field>
                  <FieldLabel htmlFor="role">
                    Level Hak Akses
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupAddon>
                      <ShieldCheck className="size-4" />
                    </InputGroupAddon>
                    <InputGroupInput
                      id="role"
                      value={ROLE_LABELS[profile?.role || "admin"]}
                      disabled
                    />
                  </InputGroup>
                </Field>
              </FieldGroup>

              <div className="flex justify-end pt-6">
                <Button
                  type="submit"
                  size="lg"
                  disabled={loading || uploading}
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
