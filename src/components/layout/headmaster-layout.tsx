import { useState, useEffect, type ReactNode } from "react";
import { Outlet, Link, useLocation, Navigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  SidebarRail,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  LogOut,
  User,
  Users,
  ClipboardList,
  HelpCircle,
  School as SchoolIcon,
} from "lucide-react";
import { AuthService } from "@/lib/services/auth-service";
import { SchoolService } from "@/lib/services/school-service";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/auth-context";
import { ModeToggle } from "@/components/mode-toggle";
import { Skeleton } from "@/components/ui/skeleton";

interface HeadmasterLayoutProps {
  children?: ReactNode;
}

export default function HeadmasterLayout({ children }: HeadmasterLayoutProps) {
  const { profile } = useAuth();
  const location = useLocation();
  const [schoolName, setSchoolName] = useState<string>("");
  const [isSchoolLoading, setIsSchoolLoading] = useState(false);

  useEffect(() => {
    async function fetchSchoolName() {
      if (profile?.schoolId) {
        try {
          setIsSchoolLoading(true);
          const school = await SchoolService.getSchoolById(profile.schoolId);
          setSchoolName(school.name);
        } catch (error) {
          console.error("Error fetching school name:", error);
        } finally {
          setIsSchoolLoading(false);
        }
      }
    }

    fetchSchoolName();
  }, [profile?.schoolId]);

  if (profile?.role === "headmaster" && !profile?.schoolId && location.pathname !== "/headmaster/set-school") {
    return <Navigate to="/headmaster/set-school" replace />;
  }

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      toast.success("Berhasil keluar");
    } catch {
      toast.error("Gagal keluar");
    }
  };

  const navItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      url: "/headmaster",
    },
    {
      title: "Laporan Hasil",
      icon: ClipboardList,
      url: "/headmaster/reports",
    },
    {
      title: "Guru & Staf",
      icon: Users,
      url: "/headmaster/users",
    },
  ];

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2 py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ClipboardList className="h-4 w-4" />
            </div>
            <div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
              <span className="font-semibold line-clamp-1">LJK Lestari Ilmu</span>
              {isSchoolLoading ? (
                <Skeleton className="h-3 w-20 mt-1" />
              ) : (
                <span className="text-xs text-muted-foreground truncate max-w-37.5 line-clamp-1">
                  Kepala Sekolah
                </span>
              )}
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === item.url}
                      tooltip={item.title}
                    >
                      <Link to={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={profile?.photoUrl || profile?.name || ""} alt={profile?.name || "User"} />
                      <AvatarFallback className="rounded-lg">
                        {profile?.name?.substring(0, 2).toUpperCase() || "KS"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{profile?.name || "Kepala Sekolah"}</span>
                      <span className="truncate text-xs">{profile?.email}</span>
                    </div>
                    <User className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  side="bottom"
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarImage src={profile?.photoUrl || profile?.name || ""} alt={profile?.name || "User"} />
                        <AvatarFallback className="rounded-lg">
                          {profile?.name?.substring(0, 2).toUpperCase() || "KS"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">{profile?.name}</span>
                        <span className="truncate text-xs">{profile?.email}</span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link to="/headmaster/profile">
                        <User className="mr-2 h-4 w-4" />
                        Profil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        to="https://api.whatsapp.com/send?phone=6285161234895&text=Aku%20ingin%20bertanya%20"
                        target="_blank"
                      >
                        <HelpCircle className="mr-2 h-4 w-4" />
                        Bantuan
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Keluar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b px-4 bg-background z-10 sticky top-0">
          <div className="flex items-center gap-2 px-1">
            <SidebarTrigger className="-ml-1" />
            <div className="h-4 w-px bg-border mx-2 hidden sm:block" />
            <div className="hidden sm:flex items-center gap-2 ">
              <SchoolIcon className="h-4 w-4 text-muted-foreground" />
              {isSchoolLoading ? (
                <Skeleton className="h-4 w-32" />
              ) : (
                <span className="text-sm font-medium truncate max-w-48 lg:max-w-96">
                  {schoolName || "Sekolah Belum Terdaftar"}
                </span>
              )}
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <ModeToggle />
            <Link
              to="//api.whatsapp.com/send?phone=6285161234895&text=Aku%20ingin%20bertanya%20"
              target="_blank"
              className="h-9 w-9 flex items-center justify-center rounded-md border hover:bg-accent"
            >
              <HelpCircle className="h-4 w-4" />
            </Link>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          {children || <Outlet />}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
