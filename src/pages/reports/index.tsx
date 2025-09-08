import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ReportCategoryCard } from "./components/ReportCategoryCard";
import { useReportsData } from "./hooks/useReportsData";
import { 
  Download,
  FileText,
  Database,
  PieChart,
  Clock
} from "lucide-react";

export default function Reports() {
  const { 
    dashboardStats, 
    reportCategories, 
    reportLogs,
    loading 
  } = useReportsData();

  const quickStats = [
    {
      title: "Reports Generated",
      value: dashboardStats.reportsGenerated.toString(),
      change: "+23 this month",
      icon: FileText,
      color: "text-blue-600"
    },
    {
      title: "Data Points",
      value: `${(dashboardStats.dataPoints / 1000).toFixed(1)}K`,
      change: "Metrics tracked",
      icon: Database,
      color: "text-green-600"
    },
    {
      title: "Active Dashboards",
      value: dashboardStats.activeDashboards.toString(),
      change: "Real-time updates",
      icon: PieChart,
      color: "text-purple-600"
    },
    {
      title: "Scheduled Reports",
      value: dashboardStats.scheduledReports.toString(),
      change: "Automated delivery",
      icon: Clock,
      color: "text-orange-600"
    }
  ];

  return (
    <div className="container mx-auto py-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-2">
            Generate insights and track performance metrics
          </p>
        </div>
        <Button className="gap-2">
          <Download className="h-4 w-4" />
          Export Data
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <IconComponent className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Report Categories */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">Report Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reportCategories.map((category, index) => (
            <ReportCategoryCard
              key={category.id}
              category={category}
            />
          ))}
        </div>
      </div>

      {/* Recent Reports */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">Recent Reports</h2>
        <Card>
          <CardHeader>
            <CardTitle>Generated Reports</CardTitle>
            <CardDescription>Recent report activity and status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No reports generated yet. Generate your first report above.
                </div>
              ) : (
                reportLogs.slice(0, 5).map((log, index) => (
                  <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium">{log.report_name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {log.report_type} • {new Date(log.created_at).toLocaleDateString()}
                        {log.records_processed && ` • ${log.records_processed} records`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        log.status === 'completed' ? 'default' :
                        log.status === 'generating' ? 'secondary' : 'destructive'
                      }>
                        {log.status}
                      </Badge>
                      {log.status === 'completed' && (
                        <Button size="sm" variant="ghost">
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}