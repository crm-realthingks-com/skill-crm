export type SkillLevel = 'beginner' | 'intermediate' | 'proficient' | 'expert' | 'master';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
}

export interface SkillAssessment {
  memberId: string;
  skillId: string;
  level: SkillLevel;
  lastUpdated: Date;
}

export interface SkillMatrixData {
  members: TeamMember[];
  skills: Skill[];
  assessments: SkillAssessment[];
}