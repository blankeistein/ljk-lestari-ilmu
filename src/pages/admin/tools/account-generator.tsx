import { useState } from "react";
import { DevService } from "@/lib/services/dev-service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Users, Wrench } from "lucide-react";

export default function AccountGeneratorPage() {
  const [count, setCount] = useState(10);
  const [role, setRole] = useState("teacher");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (count <= 0 || count > 100) {
      toast.error("Jumlah harus antara 1 dan 100");
      return;
    }

    setLoading(true);
    try {
      await DevService.generateMockUsers(count, role);
      toast.success(`Berhasil membuat ${count} akun mock`);
    } catch (error) {
      console.error("Error generating users:", error);
      toast.error("Gagal membuat akun mock");
    } finally {
      setLoading(false);
    }
  };

  if (import.meta.env.PROD) {
    return (
      <div className="flex h-96 shrink-0 items-center justify-center rounded-md border border-dashed">
        <div className="mx-auto flex max-w-sm flex-col items-center justify-center text-center">
          <Wrench className="h-10 w-10 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Developer Mode Only</h3>
          <p className="mb-4 mt-2 text-sm text-muted-foreground">
            Halaman ini hanya tersedia dalam mode pengembangan.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Akun Generator</h1>
        <p className="text-muted-foreground">
          Tools untuk membuat data user dummy secara massal untuk keperluan testing.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Generate Akun
            </CardTitle>
            <CardDescription>
              Buat akun dummy langsung ke Firestore.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="count">Jumlah Akun (Maks 100)</Label>
              <Input
                id="count"
                type="number"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value))}
                min={1}
                max={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Pilih role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="teacher">Guru</SelectItem>
                  <SelectItem value="headmaster">Kepala Sekolah</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              className="w-full"
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Sekarang"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
