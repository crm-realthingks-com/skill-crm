import { supabase } from "@/integrations/supabase/client";
import type { 
  ReportFilters, 
  ReportData, 
  GeneratedReport, 
  ExportFormat,
  ReportLog,
  SkillRatingHistory,
  ApprovalHistory,
  TrainingParticipation 
} from "../types/reportTypes";

export class ReportService {
  private async logReportGeneration(
    reportType: string,
    reportName: string,
    filters: ReportFilters,
    status: 'generating' | 'completed' | 'failed' = 'generating',
    errorMessage?: string
  ): Promise<string> {
    const user = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('report_logs')
      .insert({
        report_type: reportType,
        report_name: reportName,
        filters: filters as any,
        status,
        error_message: errorMessage,
        records_processed: 0,
        generated_by: user.data.user?.id || ''
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }

  private async updateReportLog(
    logId: string,
    status: 'completed' | 'failed',
    recordsProcessed: number = 0,
    executionTime: number = 0,
    errorMessage?: string
  ) {
    await supabase
      .from('report_logs')
      .update({
        status,
        records_processed: recordsProcessed,
        execution_time_ms: executionTime,
        completed_at: new Date().toISOString(),
        error_message: errorMessage
      })
      .eq('id', logId);
  }

  async generateSkillsGapAnalysis(filters: ReportFilters): Promise<GeneratedReport> {
    const startTime = Date.now();
    const logId = await this.logReportGeneration('Skills Analytics', 'Skills Gap Analysis', filters);

    try {
      // Get required skills from projects
      const { data: projectSkills, error: projectError } = await supabase
        .from('project_assignments')
        .select(`
          project_id,
          user_id,
          projects (
            name,
            tech_lead_id
          )
        `);

      if (projectError) throw projectError;

      // Get approved skill ratings
      const { data: approvedRatings, error: ratingsError } = await supabase
        .from('skill_rating_history')
        .select(`
          user_id,
          skill_id,
          subskill_id,
          rating,
          created_at,
          skills (
            name,
            skill_categories (
              name
            )
          ),
          subskills (
            name
          )
        `)
        .eq('rating_type', 'approved')
        .eq('status', 'active');

      if (ratingsError) throw ratingsError;

      // Get user profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, user_id, full_name, department');

      if (profilesError) throw profilesError;

      // Process data for gap analysis
      const gapAnalysis = this.processSkillsGapData(
        projectSkills || [],
        approvedRatings || [],
        profiles || [],
        filters
      );

      const executionTime = Date.now() - startTime;
      await this.updateReportLog(logId, 'completed', gapAnalysis.rows.length / 7, executionTime);

      return {
        id: logId,
        name: 'Skills Gap Analysis',
        type: 'Skills Analytics',
        data: gapAnalysis,
        filters,
        generated_at: new Date().toISOString(),
        generated_by: (await supabase.auth.getUser()).data.user?.id || ''
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      await this.updateReportLog(logId, 'failed', 0, executionTime, error.message);
      throw error;
    }
  }

  async generateProficiencyTrends(filters: ReportFilters): Promise<GeneratedReport> {
    const startTime = Date.now();
    const logId = await this.logReportGeneration('Skills Analytics', 'Proficiency Trends', filters);

    try {
      // Get historical skill ratings
      const { data: ratingHistory, error } = await supabase
        .from('skill_rating_history')
        .select(`
          user_id,
          skill_id,
          rating_type,
          rating,
          created_at,
          skills (
            name,
            skill_categories (
              name
            )
          )
        `)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Get user profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, user_id, full_name, department');

      if (profilesError) throw profilesError;

      const trendsData = this.processProficiencyTrends(
        ratingHistory || [],
        profiles || [],
        filters
      );

      const executionTime = Date.now() - startTime;
      await this.updateReportLog(logId, 'completed', trendsData.rows.length / 6, executionTime);

      return {
        id: logId,
        name: 'Proficiency Trends',
        type: 'Skills Analytics',
        data: trendsData,
        filters,
        generated_at: new Date().toISOString(),
        generated_by: (await supabase.auth.getUser()).data.user?.id || ''
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      await this.updateReportLog(logId, 'failed', 0, executionTime, error.message);
      throw error;
    }
  }

  async generateTeamProductivity(filters: ReportFilters): Promise<GeneratedReport> {
    const startTime = Date.now();
    const logId = await this.logReportGeneration('Team Performance', 'Team Productivity', filters);

    try {
      // Get project assignments and completion data
      const { data: assignments, error } = await supabase
        .from('project_assignments')
        .select(`
          user_id,
          project_id,
          created_at,
          projects (
            name,
            status,
            start_date,
            end_date,
            tech_lead_id
          )
        `);

      if (error) throw error;

      // Get approved skill ratings for team members
      const { data: skills, error: skillsError } = await supabase
        .from('skill_rating_history')
        .select(`
          user_id,
          skill_id,
          rating,
          created_at,
          skills (
            name,
            skill_categories (
              name
            )
          )
        `)
        .eq('rating_type', 'approved')
        .eq('status', 'active');

      if (skillsError) throw skillsError;

      // Get user profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, user_id, full_name, department, tech_lead_id');

      if (profilesError) throw profilesError;

      const productivityData = this.processTeamProductivity(
        assignments || [],
        skills || [],
        profiles || [],
        filters
      );

      const executionTime = Date.now() - startTime;
      await this.updateReportLog(logId, 'completed', productivityData.rows.length / 5, executionTime);

      return {
        id: logId,
        name: 'Team Productivity',
        type: 'Team Performance',
        data: productivityData,
        filters,
        generated_at: new Date().toISOString(),
        generated_by: (await supabase.auth.getUser()).data.user?.id || ''
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      await this.updateReportLog(logId, 'failed', 0, executionTime, error.message);
      throw error;
    }
  }

  private processSkillsGapData(
    projectSkills: any[],
    approvedRatings: any[],
    profiles: any[],
    filters: ReportFilters
  ): ReportData {
    // Process skills gap analysis logic
    const headers = ['Employee', 'Department', 'Skill Category', 'Skill', 'Current Rating', 'Required Rating', 'Gap'];
    const rows: (string | number)[] = [];

    // Implementation logic for gap analysis
      approvedRatings.forEach(rating => {
        const profile = profiles.find(p => p.user_id === rating.user_id);
        if (profile && this.matchesFilters(rating, profile, filters)) {
          const row = [
            profile.full_name,
            profile.department || 'N/A',
            rating.skills?.skill_categories?.name || 'Unknown',
            rating.skills?.name || 'Unknown',
            rating.rating,
            'high', // This would come from project requirements
            rating.rating === 'high' ? 'None' : 'Gap exists'
          ];
          rows.push(...row);
        }
      });

    return {
      headers,
      rows,
      charts: [{
        type: 'bar',
        title: 'Skills Gap by Category',
        data: [],
        xAxisKey: 'category',
        yAxisKey: 'gap_count'
      }]
    };
  }

  private processProficiencyTrends(
    ratingHistory: any[],
    profiles: any[],
    filters: ReportFilters
  ): ReportData {
    const headers = ['Employee', 'Skill', 'Self Rating', 'Approved Rating', 'Improvement', 'Date'];
    const rows: (string | number)[] = [];

    // Group ratings by user and skill
    const ratingsMap = new Map();
    ratingHistory.forEach(rating => {
      const key = `${rating.user_id}-${rating.skill_id}`;
      if (!ratingsMap.has(key)) {
        ratingsMap.set(key, { self: [], approved: [] });
      }
      ratingsMap.get(key)[rating.rating_type].push(rating);
    });

    ratingsMap.forEach((ratings, key) => {
      const [userId] = key.split('-');
      const profile = profiles.find(p => p.user_id === userId);
      
      if (profile && ratings.approved.length > 0) {
        const latestApproved = ratings.approved[ratings.approved.length - 1];
        const latestSelf = ratings.self[ratings.self.length - 1];
        
        if (this.matchesFilters(latestApproved, profile, filters)) {
          const row = [
            profile.full_name,
            latestApproved.skills?.name || 'Unknown',
            latestSelf?.rating || 'N/A',
            latestApproved.rating,
            this.calculateImprovement(ratings.approved),
            new Date(latestApproved.created_at).toLocaleDateString()
          ];
          rows.push(...row);
        }
      }
    });

    return {
      headers,
      rows,
      charts: [{
        type: 'line',
        title: 'Skill Proficiency Over Time',
        data: [],
        xAxisKey: 'date',
        yAxisKey: 'rating'
      }]
    };
  }

  private processTeamProductivity(
    assignments: any[],
    skills: any[],
    profiles: any[],
    filters: ReportFilters
  ): ReportData {
    const headers = ['Employee', 'Department', 'Projects Assigned', 'Skills Applied', 'Productivity Score'];
    const rows: (string | number)[] = [];

    const userStats = new Map();
    
    assignments.forEach(assignment => {
      const profile = profiles.find(p => p.user_id === assignment.user_id);
      if (profile && this.matchesFilters(assignment, profile, filters)) {
        if (!userStats.has(assignment.user_id)) {
          userStats.set(assignment.user_id, {
            profile,
            projects: 0,
            skills: skills.filter(s => s.user_id === assignment.user_id).length
          });
        }
        userStats.get(assignment.user_id).projects++;
      }
    });

    userStats.forEach((stats, userId) => {
      const productivityScore = this.calculateProductivityScore(stats.projects, stats.skills);
      const row = [
        stats.profile.full_name,
        stats.profile.department || 'N/A',
        stats.projects,
        stats.skills,
        productivityScore
      ];
      rows.push(...row);
    });

    return {
      headers,
      rows,
      charts: [{
        type: 'bar',
        title: 'Team Productivity by Department',
        data: [],
        xAxisKey: 'department',
        yAxisKey: 'productivity'
      }]
    };
  }

  private matchesFilters(data: any, profile: any, filters: ReportFilters): boolean {
    if (filters.employee_ids && !filters.employee_ids.includes(profile.user_id)) return false;
    if (filters.departments && profile.department && !filters.departments.includes(profile.department)) return false;
    if (filters.start_date && data.created_at < filters.start_date) return false;
    if (filters.end_date && data.created_at > filters.end_date) return false;
    return true;
  }

  private calculateImprovement(approvedRatings: any[]): string {
    if (approvedRatings.length < 2) return 'N/A';
    
    const ratingValues = { low: 1, medium: 2, high: 3 };
    const first = ratingValues[approvedRatings[0].rating];
    const latest = ratingValues[approvedRatings[approvedRatings.length - 1].rating];
    
    const improvement = latest - first;
    return improvement > 0 ? `+${improvement}` : improvement === 0 ? 'No change' : `${improvement}`;
  }

  private calculateProductivityScore(projects: number, skills: number): number {
    // Simple productivity scoring formula
    return Math.round((projects * 0.6 + skills * 0.4) * 10) / 10;
  }

  async exportReport(report: GeneratedReport, format: ExportFormat): Promise<string> {
    // Implementation for different export formats
    switch (format) {
      case 'csv':
        return this.exportToCSV(report);
      case 'xlsx':
        return this.exportToXLSX(report);
      case 'pdf':
        return this.exportToPDF(report);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  private exportToCSV(report: GeneratedReport): string {
    const { headers, rows } = report.data;
    
    // Convert rows to properly formatted CSV rows
    const csvRows = [];
    for (let i = 0; i < rows.length; i += headers.length) {
      const rowData = rows.slice(i, i + headers.length);
      csvRows.push(rowData.join(','));
    }
    
    const csvContent = [
      headers.join(','),
      ...csvRows
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    return url;
  }

  private exportToXLSX(report: GeneratedReport): string {
    // XLSX export implementation would go here
    // For now, fallback to CSV
    return this.exportToCSV(report);
  }

  private exportToPDF(report: GeneratedReport): string {
    // PDF export implementation would go here
    // For now, fallback to CSV
    return this.exportToCSV(report);
  }

  async getReportLogs(limit: number = 50): Promise<ReportLog[]> {
    const { data, error } = await supabase
      .from('report_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []).map(item => ({
      ...item,
      filters: item.filters as Record<string, any> || {},
      status: item.status as 'generating' | 'completed' | 'failed'
    }));
  }
}

export const reportService = new ReportService();