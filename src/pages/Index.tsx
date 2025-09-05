import { useState } from 'react';
import { SkillMatrix } from '@/components/SkillMatrix';
import { SkillMatrixData } from '@/types/skill-matrix';

const Index = () => {
  const [matrixData, setMatrixData] = useState<SkillMatrixData>({
    members: [
      {
        id: '1',
        name: 'Sarah Johnson',
        role: 'Frontend Developer',
      },
      {
        id: '2',
        name: 'Mike Chen',
        role: 'Full Stack Engineer',
      },
      {
        id: '3',
        name: 'Emma Davis',
        role: 'UX Designer',
      },
      {
        id: '4',
        name: 'Alex Rodriguez',
        role: 'Backend Developer',
      },
    ],
    skills: [
      { id: '1', name: 'React', category: 'Frontend' },
      { id: '2', name: 'TypeScript', category: 'Frontend' },
      { id: '3', name: 'CSS/Tailwind', category: 'Frontend' },
      { id: '4', name: 'Node.js', category: 'Backend' },
      { id: '5', name: 'Python', category: 'Backend' },
      { id: '6', name: 'PostgreSQL', category: 'Backend' },
      { id: '7', name: 'Figma', category: 'Design' },
      { id: '8', name: 'User Research', category: 'Design' },
      { id: '9', name: 'Project Management', category: 'Soft Skills' },
      { id: '10', name: 'Leadership', category: 'Soft Skills' },
    ],
    assessments: [
      { memberId: '1', skillId: '1', level: 'expert', lastUpdated: new Date() },
      { memberId: '1', skillId: '2', level: 'proficient', lastUpdated: new Date() },
      { memberId: '1', skillId: '3', level: 'expert', lastUpdated: new Date() },
      { memberId: '1', skillId: '7', level: 'intermediate', lastUpdated: new Date() },
      { memberId: '1', skillId: '9', level: 'proficient', lastUpdated: new Date() },
      
      { memberId: '2', skillId: '1', level: 'proficient', lastUpdated: new Date() },
      { memberId: '2', skillId: '2', level: 'expert', lastUpdated: new Date() },
      { memberId: '2', skillId: '4', level: 'expert', lastUpdated: new Date() },
      { memberId: '2', skillId: '6', level: 'proficient', lastUpdated: new Date() },
      { memberId: '2', skillId: '9', level: 'expert', lastUpdated: new Date() },
      { memberId: '2', skillId: '10', level: 'proficient', lastUpdated: new Date() },
      
      { memberId: '3', skillId: '7', level: 'master', lastUpdated: new Date() },
      { memberId: '3', skillId: '8', level: 'expert', lastUpdated: new Date() },
      { memberId: '3', skillId: '1', level: 'beginner', lastUpdated: new Date() },
      { memberId: '3', skillId: '3', level: 'intermediate', lastUpdated: new Date() },
      { memberId: '3', skillId: '9', level: 'proficient', lastUpdated: new Date() },
      
      { memberId: '4', skillId: '4', level: 'expert', lastUpdated: new Date() },
      { memberId: '4', skillId: '5', level: 'master', lastUpdated: new Date() },
      { memberId: '4', skillId: '6', level: 'expert', lastUpdated: new Date() },
      { memberId: '4', skillId: '2', level: 'proficient', lastUpdated: new Date() },
      { memberId: '4', skillId: '10', level: 'intermediate', lastUpdated: new Date() },
    ],
  });

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <SkillMatrix data={matrixData} onUpdateData={setMatrixData} />
      </div>
    </div>
  );
};

export default Index;
