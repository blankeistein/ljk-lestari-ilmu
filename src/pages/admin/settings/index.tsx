import { useState, useEffect } from "react";
import { SettingsService, type AppSettings } from "@/lib/services/settings-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Save, ExternalLink, ShieldCheck, HelpCircle } from "lucide-react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [settings, setSettings] = useState<AppSettings>({
    privacy_policy_url: "",
    help_url: "",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setFetching(true);
      const data = await SettingsService.getAppSettings();
      setSettings(data);
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Gagal mengambil pengaturan dari Remote Config");
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await SettingsService.updateAppSettings(settings);
      toast.success("Pengaturan berhasil disimpan ke Remote Config");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Gagal menyimpan pengaturan");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex h-100 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-lg font-medium">Memuat pengaturan...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Pengaturan App</h1>
      </div>

      <div className="grid gap-6">
        <form onSubmit={handleSave}>
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Link Eksternal</CardTitle>
              <CardDescription>
                Kelola tautan yang akan didistribusikan ke aplikasi klien melalui Remote Config.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="privacy_policy" className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" /> Kebijakan Privasi (URL)
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="privacy_policy"
                    placeholder="https://example.com/privacy"
                    value={settings.privacy_policy_url}
                    onChange={(e) => setSettings({ ...settings, privacy_policy_url: e.target.value })}
                    required
                  />
                  {settings.privacy_policy_url && (
                    <Button variant="outline" size="icon" asChild>
                      <a href={settings.privacy_policy_url} target="_blank" rel="noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="help_url" className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" /> Link Bantuan (URL)
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="help_url"
                    placeholder="https://example.com/help"
                    value={settings.help_url}
                    onChange={(e) => setSettings({ ...settings, help_url: e.target.value })}
                    required
                  />
                  {settings.help_url && (
                    <Button variant="outline" size="icon" asChild>
                      <a href={settings.help_url} target="_blank" rel="noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t p-6">
              <p className="text-xs text-muted-foreground italic max-w-[70%]">
                * Perubahan akan diterbitkan langsung ke Firebase Remote Config template.
                Aplikasi klien mungkin membutuhkan waktu beberapa saat untuk menerima pembaruan sesuai durasi cache.
              </p>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Simpan
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  );
}
