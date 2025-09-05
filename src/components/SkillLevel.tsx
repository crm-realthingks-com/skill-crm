import { SkillLevel as SkillLevelType } from '@/types/skill-matrix';

interface SkillLevelProps {
  level: SkillLevelType | null;
  onClick?: (level: SkillLevelType) => void;
  interactive?: boolean;
}

const skillLevels: { level: SkillLevelType; label: string; color: string }[] = [
  { level: 'beginner', label: 'Beginner', color: 'bg-skill-beginner' },
  { level: 'intermediate', label: 'Intermediate', color: 'bg-skill-intermediate' },
  { level: 'proficient', label: 'Proficient', color: 'bg-skill-proficient' },
  { level: 'expert', label: 'Expert', color: 'bg-skill-expert' },
  { level: 'master', label: 'Master', color: 'bg-skill-master' },
];

export const SkillLevel = ({ level, onClick, interactive = false }: SkillLevelProps) => {
  if (!level) {
    return (
      <div className="w-6 h-6 rounded-full border-2 border-muted bg-muted/20" />
    );
  }

  const skillLevel = skillLevels.find(sl => sl.level === level);
  if (!skillLevel) return null;

  return (
    <div
      className={`
        w-6 h-6 rounded-full shadow-skill transition-all duration-200
        ${skillLevel.color}
        ${interactive ? 'cursor-pointer hover:scale-110 hover:shadow-lg' : ''}
      `}
      onClick={() => interactive && onClick?.(level)}
      title={`${skillLevel.label} level`}
    />
  );
};

export const SkillLevelSelector = ({ 
  currentLevel, 
  onSelect 
}: { 
  currentLevel: SkillLevelType | null; 
  onSelect: (level: SkillLevelType) => void; 
}) => {
  return (
    <div className="flex gap-2 p-2 bg-card rounded-lg border shadow-card">
      {skillLevels.map(({ level, label, color }) => (
        <button
          key={level}
          onClick={() => onSelect(level)}
          className={`
            w-8 h-8 rounded-full transition-all duration-200 hover:scale-110
            ${color}
            ${currentLevel === level ? 'ring-2 ring-primary shadow-lg' : 'shadow-skill'}
          `}
          title={label}
        />
      ))}
    </div>
  );
};