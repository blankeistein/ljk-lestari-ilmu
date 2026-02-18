import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, FileText } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { useServerStatus } from "@/hooks/use-server-status";


const recentSales = [
  {
    name: "Budi Santoso",
    email: "budi@sekolah.sch.id",
    amount: "150 LJK",
    status: "success",
    date: "Baru saja",
  },
  {
    name: "Siti Aminah",
    email: "siti@sekolah.sch.id",
    amount: "45 LJK",
    status: "processing",
    date: "5 menit lalu",
  },
  {
    name: "Ahmad Fauzi",
    email: "ahmad@sekolah.sch.id",
    amount: "200 LJK",
    status: "success",
    date: "1 jam lalu",
  },
  {
    name: "Dewi Ratna",
    email: "dewi@sekolah.sch.id",
    amount: "Error",
    status: "failed",
    date: "2 jam lalu",
  },
  {
    name: "Rudi Hartono",
    email: "rudi@sekolah.sch.id",
    amount: "80 LJK",
    status: "success",
    date: "3 jam lalu",
  },
];

export default function AdminDashboard() {
  const { totalUser, totalLjk, growthData } = useDashboardStats();
  const { firestoreStatus, storageStatus, functionsStatus } = useServerStatus();

  const getStatusBadge = (status: "online" | "offline" | "loading") => {
    switch (status) {
      case "online":
        return <Badge className="bg-green-500 hover:bg-green-600">Connected</Badge>;
      case "offline":
        return <Badge variant="destructive">Disconnected</Badge>;
      case "loading":
        return <Badge variant="outline" className="animate-pulse">Checking...</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview sistem dan aktivitas pengguna hari ini.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm py-1 px-3">
            v1.0.0
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Pengguna
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalUser.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              LJK Terproses
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalLjk.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Statistik Pertumbuhan Pengguna</CardTitle>
            <CardDescription>
              Jumlah pengguna dalam seminggu
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={growthData}>
                <XAxis
                  dataKey="name"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip
                  contentStyle={{ background: 'var(--background)', borderColor: 'var(--border)' }}
                  itemStyle={{ color: 'var(--foreground)' }}
                  cursor={{ fill: 'var(--muted)' }}
                />
                <Bar
                  dataKey="total"
                  fill="currentColor"
                  radius={[4, 4, 0, 0]}
                  className="fill-primary"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Status Server</CardTitle>
            <CardDescription>Koneksi ke layanan backend</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Database</span>
                {getStatusBadge(firestoreStatus)}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Storage</span>
                {getStatusBadge(storageStatus)}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Cloud Functions</span>
                {getStatusBadge(functionsStatus)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
