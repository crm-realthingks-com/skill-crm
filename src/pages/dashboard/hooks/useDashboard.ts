import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface DashboardStats {
  totalTeamMembers: string;
  skillsTracked: string;
  completedAssessments: string;
  pendingReviews: string;
}

export const useDashboard = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalTeamMembers: "0",
    skillsTracked: "0", 
    completedAssessments: "0%",
    pendingReviews: "0"
  });
  
  const [loading, setLoading] = useState(true);

  const fetchDashboardStats = async () => {
    if (!profile) return;
    
    try {
      setLoading(true);
      
      // Get total team members
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id')
        .eq('status', 'active');
      
      // Get total skills tracked
      const { data: skills } = await supabase
        .from('skills')
        .select('id');
      
      // Get completed assessments (approved ratings)
      const { data: totalRatings } = await supabase
        .from('employee_ratings')
        .select('id');
        
      const { data: approvedRatings } = await supabase
        .from('employee_ratings')
        .select('id')
        .eq('status', 'approved');
      
      // Get pending reviews
      const { data: pendingRatings } = await supabase
        .from('employee_ratings')
        .select('id')
        .eq('status', 'submitted');
      
      const completionRate = totalRatings?.length 
        ? Math.round((approvedRatings?.length || 0) / totalRatings.length * 100)
        : 0;
      
      setStats({
        totalTeamMembers: (profiles?.length || 0).toString(),
        skillsTracked: (skills?.length || 0).toString(),
        completedAssessments: `${completionRate}%`,
        pendingReviews: (pendingRatings?.length || 0).toString()
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, [profile]);
  
  return {
    stats,
    loading,
    refreshStats: fetchDashboardStats
  };
};