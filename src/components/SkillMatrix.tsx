import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SkillLevel, SkillLevelSelector } from './SkillLevel';
import { AddMemberDialog } from './AddMemberDialog';
import { AddSkillDialog } from './AddSkillDialog';
import { 
  TeamMember, 
  Skill, 
  SkillAssessment, 
  SkillMatrixData,
  SkillLevel as SkillLevelType 
} from '@/types/skill-matrix';

interface SkillMatrixProps {
  data: SkillMatrixData;
  onUpdateData: (data: SkillMatrixData) => void;
}

export const SkillMatrix = ({ data, onUpdateData }: SkillMatrixProps) => {
  const [editingCell, setEditingCell] = useState<{ memberId: string; skillId: string } | null>(null);

  const getSkillLevel = (memberId: string, skillId: string): SkillLevelType | null => {
    const assessment = data.assessments.find(
      a => a.memberId === memberId && a.skillId === skillId
    );
    return assessment?.level || null;
  };

  const updateSkillLevel = (memberId: string, skillId: string, level: SkillLevelType) => {
    const existingIndex = data.assessments.findIndex(
      a => a.memberId === memberId && a.skillId === skillId
    );

    const newAssessment: SkillAssessment = {
      memberId,
      skillId,
      level,
      lastUpdated: new Date()
    };

    const newAssessments = [...data.assessments];
    if (existingIndex >= 0) {
      newAssessments[existingIndex] = newAssessment;
    } else {
      newAssessments.push(newAssessment);
    }

    onUpdateData({
      ...data,
      assessments: newAssessments
    });
    setEditingCell(null);
  };

  const addMember = (memberData: Omit<TeamMember, 'id'>) => {
    const newMember: TeamMember = {
      ...memberData,
      id: Math.random().toString(36).substr(2, 9)
    };
    onUpdateData({
      ...data,
      members: [...data.members, newMember]
    });
  };

  const addSkill = (skillData: Omit<Skill, 'id'>) => {
    const newSkill: Skill = {
      ...skillData,
      id: Math.random().toString(36).substr(2, 9)
    };
    onUpdateData({
      ...data,
      skills: [...data.skills, newSkill]
    });
  };

  const groupedSkills = data.skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  const existingCategories = Object.keys(groupedSkills);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Skill Matrix
          </h1>
          <p className="text-muted-foreground mt-1">
            Track team competencies and identify skill gaps
          </p>
        </div>
        <div className="flex gap-2">
          <AddMemberDialog onAddMember={addMember} />
          <AddSkillDialog 
            onAddSkill={addSkill} 
            existingCategories={existingCategories}
          />
        </div>
      </div>

      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">Team Skills Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-max">
              {/* Header */}
              <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: '200px repeat(auto-fit, minmax(100px, 1fr))' }}>
                <div className="font-semibold text-sm text-muted-foreground">Team Member</div>
                {Object.entries(groupedSkills).map(([category, skills]) => (
                  <div key={category} className="space-y-2">
                    <Badge variant="secondary" className="text-xs">
                      {category}
                    </Badge>
                    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${skills.length}, 1fr)` }}>
                      {skills.map((skill) => (
                        <div key={skill.id} className="text-xs font-medium text-center p-1 rounded bg-muted/30">
                          {skill.name}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Matrix */}
              <div className="space-y-3">
                {data.members.map((member) => (
                  <div key={member.id} className="grid gap-4 items-center py-3 border-b border-border/50 last:border-0">
                    <div className="grid" style={{ gridTemplateColumns: '200px repeat(auto-fit, minmax(100px, 1fr))' }}>
                      {/* Member info */}
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback className="bg-gradient-primary text-primary-foreground text-sm font-semibold">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">{member.name}</div>
                          <div className="text-xs text-muted-foreground">{member.role}</div>
                        </div>
                      </div>

                      {/* Skills */}
                      {Object.values(groupedSkills).map((skills, categoryIndex) => (
                        <div key={categoryIndex} className="grid gap-2 justify-items-center" style={{ gridTemplateColumns: `repeat(${skills.length}, 1fr)` }}>
                          {skills.map((skill) => {
                            const isEditing = editingCell?.memberId === member.id && editingCell?.skillId === skill.id;
                            const currentLevel = getSkillLevel(member.id, skill.id);

                            return (
                              <div key={skill.id} className="relative">
                                {isEditing ? (
                                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full z-10">
                                    <SkillLevelSelector
                                      currentLevel={currentLevel}
                                      onSelect={(level) => updateSkillLevel(member.id, skill.id, level)}
                                    />
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setEditingCell({ memberId: member.id, skillId: skill.id })}
                                    className="hover:scale-110 transition-transform"
                                  >
                                    <SkillLevel level={currentLevel} />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};