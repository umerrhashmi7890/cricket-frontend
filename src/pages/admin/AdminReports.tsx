import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Download, FileText, BarChart3, TrendingUp } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const AdminReports = () => {
  const [dateRange, setDateRange] = useState("7days");
  const [reportType, setReportType] = useState("revenue");

  const revenueData = [
    { date: "Jan 8", revenue: 3200 },
    { date: "Jan 9", revenue: 4100 },
    { date: "Jan 10", revenue: 3800 },
    { date: "Jan 11", revenue: 4520 },
    { date: "Jan 12", revenue: 5200 },
    { date: "Jan 13", revenue: 4800 },
    { date: "Jan 14", revenue: 4520 },
  ];

  const utilizationData = [
    { court: "Court 1", utilization: 85 },
    { court: "Court 2", utilization: 72 },
    { court: "Court 3", utilization: 90 },
    { court: "Court 4", utilization: 65 },
    { court: "Court 5", utilization: 78 },
  ];

  const promoUsageData = [
    { code: "CRICKET10", uses: 47, discount: "1,034 SAR" },
    { code: "PLAY25", uses: 23, discount: "575 SAR" },
    { code: "NEWUSER", uses: 156, discount: "2,340 SAR" },
    { code: "WEEKEND20", uses: 89, discount: "1,890 SAR" },
  ];

  const summaryStats = [
    { label: "Total Revenue", value: "30,140 SAR", change: "+12%", icon: TrendingUp },
    { label: "Total Bookings", value: "287", change: "+8%", icon: Calendar },
    { label: "Avg. Booking Value", value: "105 SAR", change: "+3%", icon: BarChart3 },
    { label: "Promo Discounts", value: "5,839 SAR", change: "-5%", icon: FileText },
  ];

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">Analyze your business performance</p>
        </div>
        <div className="flex gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4" />
            Export PDF
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {summaryStats.map((stat, index) => (
          <div key={index} className="bg-card rounded-xl border p-6">
            <div className="flex items-center justify-between mb-2">
              <stat.icon className="w-5 h-5 text-muted-foreground" />
              <span className={`text-sm font-medium ${
                stat.change.startsWith('+') ? 'text-success' : 'text-destructive'
              }`}>
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Report Type Tabs */}
      <div className="bg-muted rounded-lg p-1 inline-flex mb-6">
        {[
          { id: 'revenue', label: 'Revenue' },
          { id: 'utilization', label: 'Court Utilization' },
          { id: 'promos', label: 'Promo Usage' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setReportType(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              reportType === tab.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Revenue Report */}
      {reportType === 'revenue' && (
        <div className="space-y-6">
          <div className="bg-card rounded-xl border p-6">
            <h2 className="font-semibold text-foreground mb-6">Daily Revenue</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Revenue Table */}
          <div className="bg-card rounded-xl border overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="font-semibold text-foreground">Daily Breakdown</h3>
            </div>
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Date</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Bookings</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {revenueData.map((row, index) => (
                  <tr key={index} className="hover:bg-muted/30">
                    <td className="px-6 py-4 text-sm text-foreground">{row.date}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground text-right">{Math.floor(row.revenue / 110)}</td>
                    <td className="px-6 py-4 text-sm font-medium text-foreground text-right">{row.revenue} SAR</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Utilization Report */}
      {reportType === 'utilization' && (
        <div className="bg-card rounded-xl border p-6">
          <h2 className="font-semibold text-foreground mb-6">Court Utilization Rate</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={utilizationData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis dataKey="court" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={80} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [`${value}%`, 'Utilization']}
                />
                <Bar 
                  dataKey="utilization" 
                  fill="hsl(var(--primary))" 
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-4">
            {utilizationData.map((court, index) => (
              <div key={index} className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">{court.court}</p>
                <p className={`text-2xl font-bold ${
                  court.utilization >= 80 ? 'text-success' :
                  court.utilization >= 60 ? 'text-secondary' :
                  'text-warning'
                }`}>
                  {court.utilization}%
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Promo Usage Report */}
      {reportType === 'promos' && (
        <div className="bg-card rounded-xl border overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="font-semibold text-foreground">Promo Code Usage</h2>
          </div>
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Promo Code</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Times Used</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Total Discount Given</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {promoUsageData.map((promo, index) => (
                <tr key={index} className="hover:bg-muted/30">
                  <td className="px-6 py-4">
                    <span className="font-mono font-medium text-foreground bg-muted px-2 py-1 rounded">
                      {promo.code}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground text-right">{promo.uses}</td>
                  <td className="px-6 py-4 text-sm font-medium text-destructive text-right">-{promo.discount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminReports;
