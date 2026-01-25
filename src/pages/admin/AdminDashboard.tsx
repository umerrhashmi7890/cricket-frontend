import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  Plus,
  ClipboardList,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { adminApi } from "@/lib/api";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface DashboardStat {
  title: string;
  value: string | number;
  change: number;
  trend: "up" | "down";
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface DashboardBooking {
  id: string;
  bookingId: string;
  customer: string;
  court: string;
  time: string;
  status: string;
  amount: string;
  paymentStatus?: string;
}

interface CourtUtilization {
  court: string;
  utilization: number;
  bookedHours: number;
  bookingsCount: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [bookings, setBookings] = useState<DashboardBooking[]>([]);
  const [courtUtilization, setCourtUtilization] = useState<CourtUtilization[]>(
    [],
  );

  console.log("Court Utilization:", courtUtilization);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const today = format(new Date(), "yyyy-MM-dd");

        // Fetch stats, bookings, and court utilization in parallel
        const [statsRes, bookingsRes, utilizationRes] = await Promise.all([
          adminApi.dashboard.getStats(today),
          adminApi.dashboard.getBookings(today),
          adminApi.dashboard.getCourtUtilization(today),
        ]);

        // Transform stats data
        if (statsRes.data) {
          const statCards: DashboardStat[] = [
            {
              title: "Today's Bookings",
              value: statsRes.data.bookings.value,
              change: statsRes.data.bookings.change,
              trend: statsRes.data.bookings.trend,
              icon: Calendar,
              color: "bg-primary/10 text-primary",
            },
            {
              title: "Today's Revenue",
              value: `${statsRes.data.revenue.value} ${statsRes.data.revenue.currency}`,
              change: statsRes.data.revenue.change,
              trend: statsRes.data.revenue.trend,
              icon: DollarSign,
              color: "bg-success/10 text-success",
            },
            {
              title: "Court Utilization",
              value: `${statsRes.data.utilization.value}%`,
              change: statsRes.data.utilization.change,
              trend: statsRes.data.utilization.trend,
              icon: TrendingUp,
              color: "bg-secondary/10 text-secondary",
            },
            {
              title: "Active Customers",
              value: statsRes.data.customers.value,
              change: statsRes.data.customers.change,
              trend: statsRes.data.customers.trend,
              icon: Users,
              color: "bg-warning/10 text-warning",
            },
          ];
          setStats(statCards);
        }

        // Set bookings data
        if (bookingsRes.data) {
          setBookings(bookingsRes.data);
        }

        // Set court utilization data
        if (utilizationRes.data) {
          setCourtUtilization(utilizationRes.data);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load dashboard data",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchDashboardData, 60000);
    return () => clearInterval(interval);
  }, []);

  const quickActions = [
    { title: "Add New Court", icon: Plus, href: "/admin/courts" },
    {
      title: "Create Booking",
      icon: ClipboardList,
      href: "/admin/bookings/new",
    },
    // { title: "Generate Report", icon: FileText, href: "/admin/reports" },
  ];

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening today.
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/admin/bookings/new">
            <Button variant="default">
              <Plus className="w-4 h-4" />
              New Booking
            </Button>
          </Link>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="stat-card">
              <div className="h-12 bg-muted rounded-xl animate-pulse mb-4" />
              <div className="h-8 bg-muted rounded animate-pulse mb-2" />
              <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="mb-8 p-4 bg-destructive/10 border border-destructive rounded-lg">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Stats Grid */}
      {!loading && stats.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="flex items-start justify-between">
                <div
                  className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}
                >
                  <stat.icon className="w-6 h-6" />
                </div>
                <div
                  className={`flex items-center gap-1 text-sm ${
                    stat.trend === "up" ? "text-success" : "text-destructive"
                  }`}
                >
                  {stat.trend === "up" ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  {Math.abs(stat.change)}%
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-foreground">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Bookings */}
        <div className="lg:col-span-2 bg-card rounded-xl border">
          <div className="p-6 border-b flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Today's Bookings</h2>
            <Link to="/admin/bookings">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">
                    Customer
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">
                    Court
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">
                    Time
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">
                    Status
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-muted-foreground uppercase">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {bookings.length > 0 ? (
                  bookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-foreground">
                        {booking.customer}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {booking.court}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {booking.time}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            booking.status === "confirmed"
                              ? "bg-success/10 text-success"
                              : booking.status === "pending"
                                ? "bg-warning/10 text-warning"
                                : booking.status === "completed"
                                  ? "bg-blue-500/10 text-blue-500"
                                  : "bg-destructive/10 text-destructive"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-foreground text-right">
                        {booking.amount}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-4 text-center text-muted-foreground"
                    >
                      No bookings today
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions & Utilization */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-card rounded-xl border p-6">
            <h2 className="font-semibold text-foreground mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              {quickActions.map((action, index) => (
                <Link key={index} to={action.href}>
                  <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <action.icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-medium text-foreground">
                      {action.title}
                    </span>
                  </button>
                </Link>
              ))}
            </div>
          </div>

          {/* Court Utilization */}
          <div className="bg-card rounded-xl border p-6">
            <h2 className="font-semibold text-foreground mb-4">
              Court Utilization
            </h2>
            <div className="space-y-4">
              {courtUtilization.length > 0 ? (
                courtUtilization.map((util) => (
                  <div key={util.court}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">
                        {util.court}
                      </span>
                      <span className="font-medium text-foreground">
                        {util.utilization}%
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          util.utilization >= 80
                            ? "bg-success"
                            : util.utilization >= 50
                              ? "bg-secondary"
                              : "bg-warning"
                        }`}
                        style={{ width: `${util.utilization}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No utilization data available
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
