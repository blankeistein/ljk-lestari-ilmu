import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, FileText, Clock, TrendingUp, BookOpen, Settings } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const data = [
  {
    name: "Jan",
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: "Feb",
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: "Mar",
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: "Apr",
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: "May",
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: "Jun",
    total: Math.floor(Math.random() * 5000) + 1000,
  },
];

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
          <Badge className="bg-green-500 hover:bg-green-600 text-sm py-1 px-3">
            Online
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
            <div className="text-2xl font-bold">1,240</div>
            <p className="text-xs text-muted-foreground">
              +180 pengguna baru bulan ini
            </p>
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
            <div className="text-2xl font-bold">14,230</div>
            <p className="text-xs text-muted-foreground">
              +12% dari bulan lalu
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Proses Scan</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">573</div>
            <p className="text-xs text-muted-foreground">
              Scan dilakukan dalam 24 jam terakhir
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              Menunggu verifikasi manual
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Statistik Scan LJK</CardTitle>
            <CardDescription>
              Jumlah lembar jawab yang diproses 6 bulan terakhir.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={data}>
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
            <CardTitle>Aktivitas Terbaru</CardTitle>
            <CardDescription>
              Aktivitas scan terakhir dari pengguna.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[350px]">
              <div className="space-y-4">
                {recentSales.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${item.email}`} alt="Avatar" />
                        <AvatarFallback>{item.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{item.amount}</div>
                      <Badge variant={item.status === 'success' ? 'secondary' : item.status === 'processing' ? 'outline' : 'destructive'} className="text-[10px] px-1 py-0 h-5">
                        {item.status === 'success' ? 'Sukses' : item.status === 'processing' ? 'Proses' : 'Gagal'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Status Server</CardTitle>
            <CardDescription>Koneksi ke layanan backend</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Database</span>
                <Badge className="bg-green-500">Connected</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Storage</span>
                <Badge className="bg-green-500">Connected</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Functions</span>
                <Badge className="bg-green-500">Online</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Pintasan untuk tugas umum</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <button className="flex flex-col items-center justify-center p-2 border rounded hover:bg-muted transition-colors">
                <FileText className="h-5 w-5 mb-1" />
                <span className="text-xs">Scan Baru</span>
              </button>
              <button className="flex flex-col items-center justify-center p-2 border rounded hover:bg-muted transition-colors">
                <Users className="h-5 w-5 mb-1" />
                <span className="text-xs">Tambah User</span>
              </button>
              <button className="flex flex-col items-center justify-center p-2 border rounded hover:bg-muted transition-colors">
                <BookOpen className="h-5 w-5 mb-1" />
                <span className="text-xs">Bank Soal</span>
              </button>
              <button className="flex flex-col items-center justify-center p-2 border rounded hover:bg-muted transition-colors">
                <Settings className="h-5 w-5 mb-1" />
                <span className="text-xs">Config</span>
              </button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Notifikasi System</CardTitle>
            <CardDescription>Pemberitahuan terkini</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[120px]">
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground border-l-2 border-blue-500 pl-2">System maintenance scheduled for next Saturday at 02:00 AM.</p>
                <p className="text-muted-foreground border-l-2 border-yellow-500 pl-2">Storage capacity is at 75%. Consider upgrading plan soon.</p>
                <p className="text-muted-foreground border-l-2 border-green-500 pl-2">Successfully backed up database at 04:00 AM.</p>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
