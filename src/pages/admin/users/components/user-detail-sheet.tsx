
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { type UserProfile, ROLE_LABELS } from "@/types/user";
import { formatDate } from "@/lib/utils";
import { Mail, User, Shield, Calendar, Fingerprint } from "lucide-react";

interface UserDetailSheetProps {
  user: UserProfile | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserDetailSheet({
  user,
  isOpen,
  onOpenChange,
}: UserDetailSheetProps) {
  if (!user) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-135">
        <SheetHeader>
          <SheetTitle>Profil Pengguna</SheetTitle>
          <SheetDescription>
            Informasi lengkap mengenai akun pengguna.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-8 space-y-8 px-4">
          {/* Header/Avatar Section */}
          <div className="flex flex-col items-center space-y-4 rounded-xl bg-muted/30 p-6 border border-border/50">
            <Avatar className="h-24 w-24 border-4 border-background shadow-sm">
              <AvatarImage src={user.photoUrl || ""} />
              <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                {user.name?.substring(0, 2).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h3 className="text-xl font-bold">{user.name || "Tanpa Nama"}</h3>
              <Badge
                variant={user.role === "admin" ? "default" : user.role === "teacher" ? "secondary" : "outline"}
                className="mt-2"
              >
                {ROLE_LABELS[user.role] || user.role}
              </Badge>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid gap-6 px-1">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">Email</Label>
                <p className="text-sm font-medium">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                <User className="h-5 w-5" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">Nama Lengkap</Label>
                <p className="text-sm font-medium">{user.name || "-"}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">Role</Label>
                <p className="text-sm font-medium capitalize">{ROLE_LABELS[user.role] || user.role}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">Dibuat Pada</Label>
                <p className="text-sm font-medium">{formatDate(user.createdAt)}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                <Fingerprint className="h-5 w-5" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">System User ID</Label>
                <p className="font-mono text-[11px] text-muted-foreground break-all">{user.uid}</p>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
