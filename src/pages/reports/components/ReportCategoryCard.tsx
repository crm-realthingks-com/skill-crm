import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useReportsData } from "../hooks/useReportsData";
import type { ReportCategory } from "../types/reportTypes";

interface ReportCategoryCardProps {
  category: ReportCategory;
}

export function ReportCategoryCard({ category }: ReportCategoryCardProps) {
  const { generateReport, loading } = useReportsData();

  const handleGenerateReport = async (reportId: string) => {
    await generateReport(reportId);
  };

  const Icon = category.icon;

  return (
    <Card className={`h-full ${category.color}`}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          <CardTitle className="text-lg">{category.title}</CardTitle>
        </div>
        <CardDescription>{category.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {category.reports.map((report) => (
            <div key={report.id} className="flex items-center justify-between">
              <span className="text-sm">{report.name}</span>
              <Button 
                size="sm" 
                variant="outline"
                disabled={loading}
                onClick={() => handleGenerateReport(report.id)}
              >
                Generate
              </Button>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center pt-4 border-t">
          <Badge variant="secondary">
            {category.reports.length} reports
          </Badge>
          <Button variant="ghost" size="sm">
            View All {category.title} Reports
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}