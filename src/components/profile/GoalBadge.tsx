interface GoalBadgeProps {
  goal: string;
}

const GoalBadge = ({ goal }: GoalBadgeProps) => {
  if (!goal) {
    return <span className="fyf-goal-badge fyf-goal-badge--empty">Ziel: Noch nicht definiert</span>;
  }

  return (
    <span className="fyf-goal-badge" aria-live="polite">
      Ziel: {goal}
    </span>
  );
};

export default GoalBadge;
