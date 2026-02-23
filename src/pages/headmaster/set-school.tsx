import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";
import { toast } from "sonner";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/auth-context";
import { SchoolService } from "@/lib/services/school-service";

export default function SetSchoolPage() {
  const { profile, refreshProfile } = useAuth();
  const [schoolId, setSchoolId] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.uid) return;

    const trimmedId = schoolId.trim();
    if (!trimmedId) {
      toast.error("Kode sekolah harus diisi");
      return;
    }

    try {
      setLoading(true);

      // Verify if school exists
      try {
        await SchoolService.getSchoolById(trimmedId);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        toast.error("ID Sekolah tidak ditemukan. Silakan cek kembali kode Anda.");
        setLoading(false);
        return;
      }

      await updateDoc(doc(db, "users", profile.uid), {
        schoolId: trimmedId,
      });

      toast.success("Berhasil mengatur sekolah!");
      await refreshProfile();
      const redirectPath = profile.role === "headmaster" ? "/headmaster" : "/dashboard";
      navigate(redirectPath);
    } catch (error) {
      console.error("Error setting school:", error);
      toast.error("Gagal mengatur sekolah");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Atur Sekolah</CardTitle>
          <CardDescription>
            Masukkan kode sekolah Anda untuk melanjutkan. Hubungi admin jika Anda tidak tahu kode sekolah Anda.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="schoolCode">Kode Sekolah</FieldLabel>
                <Input
                  id="schoolCode"
                  placeholder="Masukkan kode sekolah (contoh: SCH001)"
                  value={schoolId}
                  onChange={(e) => setSchoolId(e.target.value)}
                  disabled={loading}
                  required
                />
              </Field>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan dan Lanjutkan"}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
