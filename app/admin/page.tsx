"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts"
import {
  Package, ShoppingCart, Users, DollarSign, AlertTriangle, Clock
} from "lucide-react"
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card"

const recentOrders = [
  { id: "ORD-7352", customer: "Acme Corp", date: "2025-06-09", status: "Processing", amount: "$12,450.00" },
  { id: "ORD-7351", customer: "Global Leathers", date: "2025-06-08", status: "Shipped", amount: "$8,240.00" },
  { id: "ORD-7350", customer: "Luxury Goods Inc", date: "2025-06-07", status: "Delivered", amount: "$15,800.00" },
  { id: "ORD-7349", customer: "Fashion Forward", date: "2025-06-06", status: "Processing", amount: "$5,320.00" },
]

const lowStockItems = [
  { id: "P-1001", name: "Premium Cowhide - Black", stock: 5, threshold: 10 },
  { id: "P-1042", name: "Full Grain Leather - Brown", stock: 3, threshold: 15 },
  { id: "P-1078", name: "Vegetable Tanned Hide - Natural", stock: 8, threshold: 12 },
]

const salesData = [
  { name: "Jan", sales: 4000 },
  { name: "Feb", sales: 3000 },
  { name: "Mar", sales: 5000 },
  { name: "Apr", sales: 4500 },
  { name: "May", sales: 6000 },
  { name: "Jun", sales: 5500 },
]

const categoryData = [
  { name: "Full Grain", value: 40 },
  { name: "Top Grain", value: 30 },
  { name: "Split Leather", value: 20 },
  { name: "Exotic", value: 10 },
]

const COLORS = ["#8B4513", "#A0522D", "#CD853F", "#DEB887"]

export default function AdminDashboard() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) router.push("/admin-login")
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return <div className="flex h-screen items-center justify-center text-lg font-medium">Checking authentication...</div>
  }

  return (
    <section className="space-y-10 pb-10 p-2 md:p-4">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview & insights for your store.</p>
      </header>

      {/* Metrics */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {[
          { icon: Package, label: "Total Products", value: "248", bg: "bg-blue-100", iconColor: "text-blue-600" },
          { icon: ShoppingCart, label: "New Orders", value: "12", bg: "bg-green-100", iconColor: "text-green-600" },
          { icon: Users, label: "Customers", value: "84", bg: "bg-purple-100", iconColor: "text-purple-600" },
          { icon: DollarSign, label: "Revenue", value: "$42,580", bg: "bg-amber-100", iconColor: "text-amber-600" },
        ].map(({ icon: Icon, label, value, bg, iconColor }, i) => (
          <Card key={i} className="shadow-sm hover:shadow-md transition">
            <CardContent className="p-6 flex items-center gap-5">
              <div className={`p-3 rounded-full ${bg}`}>
                <Icon className={`w-6 h-6 ${iconColor}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <h3 className="text-2xl font-semibold">{value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Monthly Sales</CardTitle>
            <CardDescription>Sales performance for the past 6 months</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#8B4513" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Product Categories</CardTitle>
            <CardDescription>Breakdown of leather types</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tables */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row justify-between items-center">
            <div>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest customer purchases</CardDescription>
            </div>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex justify-between items-center border-b pb-3 last:border-b-0">
                <div>
                  <p className="font-medium">{order.id}</p>
                  <p className="text-sm text-muted-foreground">{order.customer}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{order.amount}</p>
                  <p className="text-sm text-muted-foreground">{order.date}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row justify-between items-center">
            <div>
              <CardTitle>Low Stock Alert</CardTitle>
              <CardDescription>Reorder recommended items</CardDescription>
            </div>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent className="space-y-4">
            {lowStockItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center border-b pb-3 last:border-b-0">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">ID: {item.id}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-red-600">{item.stock} left</p>
                  <p className="text-sm text-muted-foreground">Min: {item.threshold}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
