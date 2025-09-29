import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Clock, CheckCircle, XCircle, Search, Filter, MoreVertical, Check, X, ChevronDown, User, Calendar } from "lucide-react";
import { useState } from "react";
import { useApprovals } from "./hooks/useApprovals";
import LoadingSpinner from "@/components/common/LoadingSpinner";

const Approvals = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedApproval, setExpandedApproval] = useState<string | null>(null);
  const { pendingApprovals, recentActions, loading, handleApproveRating, handleRejectRating } = useApprovals();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  // Calculate stats from data
  const stats = {
    pending: pendingApprovals?.length || 0,
    highPriority: pendingApprovals?.filter(a => a.priority === 'High')?.length || 0,
    approvedToday: recentActions?.filter(a => a.action === 'Approved' && new Date(a.date).toDateString() === new Date().toDateString())?.length || 0,
    approvedChange: "+0 from yesterday",
    avgResponseTime: "N/A",
    responseImprovement: "No data"
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-orange-100 text-orange-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex flex-col h-screen space-y-6 p-6">
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Approvals</h1>
          <p className="text-muted-foreground">
            Review and manage pending approval requests
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3 flex-shrink-0">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">{stats.highPriority} high priority</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approvedToday}</div>
            <p className="text-xs text-muted-foreground">{stats.approvedChange}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Response Time</CardTitle>
            <XCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgResponseTime}</div>
            <p className="text-xs text-muted-foreground">{stats.responseImprovement}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-2 flex-shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search approvals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Pending Approvals - Full Height */}
      <Card className="flex-1 flex flex-col min-h-0">
        <CardHeader className="flex-shrink-0 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-orange-600" />
            <CardTitle>Pending Approvals</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0 min-h-0">
          {pendingApprovals && pendingApprovals.length > 0 ? (
            <div className="flex flex-col h-full">
              {/* Header Row */}
              <div className="flex items-center justify-between px-4 py-3 bg-muted/30 text-sm font-medium border-b flex-shrink-0">
                <div className="flex items-center gap-4">
                  <span>AI User</span>
                  <span className="text-muted-foreground">|</span>
                  <span>4 Ratings</span>
                  <span className="text-muted-foreground">|</span>
                  <span>ai@realthingks.com</span>
                  <span className="text-muted-foreground">|</span>
                  <span>Submitted: 9/12/2025</span>
                </div>
                <Button size="sm" variant="outline">Review</Button>
              </div>
              
              {/* Approval Items - Scrollable Area */}
              <div className="flex-1 overflow-auto">
                {pendingApprovals.map((approval) => (
                  <div key={approval.id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/20 transition-colors border-b last:border-b-0">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <span className="font-medium whitespace-nowrap">{approval.title}</span>
                      <span className="text-muted-foreground">|</span>
                      <span className="text-muted-foreground truncate">
                        Employee comment: {approval.self_comment || 'No comment'}
                      </span>
                    </div>
                    <div className="flex gap-2 ml-4 flex-shrink-0">
                      <Button 
                        size="sm"
                        onClick={() => handleApproveRating(approval.id)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleRejectRating(approval.id, "Rejected from inline")}
                        className="border-red-200 text-red-600 hover:bg-red-50"
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-muted-foreground">No pending approvals</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Approvals;