import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";
import { RatingPill } from "@/components/common/RatingPill";
import { canUpgradeRating, getAvailableRatingOptions } from "@/pages/skills/utils/skillHelpers";
import type { Subskill, EmployeeRating } from "@/types/database";

interface SubskillRowProps {
  subskill: Subskill;
  userSkills: EmployeeRating[];
  pendingRatings: Map<string, { type: 'skill' | 'subskill', id: string, rating: 'high' | 'medium' | 'low' }>;
  isManagerOrAbove: boolean;
  onSubskillRate: (subskillId: string, rating: 'high' | 'medium' | 'low') => void;
  onRefresh: () => void;
  onEditSubskill?: () => void;
  onDeleteSubskill?: () => void;
}

export const SubskillRow = ({
  subskill,
  userSkills,
  pendingRatings,
  isManagerOrAbove,
  onSubskillRate,
  onRefresh,
  onEditSubskill,
  onDeleteSubskill
}: SubskillRowProps) => {
  // Get current rating from pending ratings or saved ratings
  const getCurrentRating = () => {
    const pending = pendingRatings.get(subskill.id);
    if (pending && pending.type === 'subskill') return pending.rating;
    return userSkills.find(us => us.subskill_id === subskill.id)?.rating as 'high' | 'medium' | 'low' | null;
  };
  
  const userSkillRating = getCurrentRating();
  const userSkillEntry = userSkills.find(us => us.subskill_id === subskill.id);
  const userSkillStatus = userSkillEntry?.status;
  const nextUpgradeDate = userSkillEntry?.next_upgrade_date;
  
  // Check progression rules
  const upgradeCheck = canUpgradeRating(userSkillRating, 'high', userSkillStatus || 'draft', nextUpgradeDate);
  const availableRatings = getAvailableRatingOptions(userSkillRating, userSkillStatus || 'draft', nextUpgradeDate);
  
  // Determine if rating is disabled - rejected ratings should be editable for resubmission
  const isSubmittedOrPending = userSkillStatus === 'submitted';
  const isHighAndApproved = userSkillRating === 'high' && userSkillStatus === 'approved';
  const isInCoolDown = userSkillStatus === 'approved' && !upgradeCheck.canUpgrade && !!upgradeCheck.daysLeft;
  const isDisabled = isSubmittedOrPending || isHighAndApproved || isInCoolDown;

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'approved':
        return 'bg-success text-success-foreground border-success';
      case 'submitted':
        return 'bg-warning text-warning-foreground border-warning';
      case 'rejected':
        return 'bg-destructive text-destructive-foreground border-destructive';
      default:
        return 'bg-muted text-muted-foreground border-muted';
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'submitted':
        return 'Pending';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Draft';
    }
  };

  return (
    <div className="flex items-center justify-between p-2 border rounded bg-muted/30">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h5 className="text-sm font-medium">{subskill.name}</h5>
          {userSkillStatus && (
            <Badge variant="secondary" className={`text-xs ${getStatusColor(userSkillStatus)}`}>
              {getStatusLabel(userSkillStatus)}
            </Badge>
          )}
          {isHighAndApproved && (
            <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800 border-amber-200">
              🔒 Locked
            </Badge>
          )}
        </div>
        {isInCoolDown && upgradeCheck.reason && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mb-1">
            {upgradeCheck.reason}
          </p>
        )}
        {subskill.description && (
          <p className="text-xs text-muted-foreground mt-1">{subskill.description}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <RatingPill
          rating={userSkillRating}
          onRatingChange={(rating) => {
            const upgradeCheck = canUpgradeRating(userSkillRating, rating, userSkillStatus || 'draft', nextUpgradeDate);
            if (upgradeCheck.canUpgrade) {
              onSubskillRate(subskill.id, rating);
            }
          }}
          disabled={isDisabled}
          availableRatings={availableRatings}
        />

        {isManagerOrAbove && (
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={onEditSubskill} className="p-1 h-auto">
              <Edit className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDeleteSubskill} className="p-1 h-auto">
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};