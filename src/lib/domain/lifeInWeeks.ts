/**
 * Domain functions for Life-in-Weeks calculations
 */

export interface LifeInWeeksData {
  weeksLived: number;
  totalWeeks: number;
  weeksRemaining: number;
  percentageLived: number;
  daysLived: number;
  remainingSummers: number;
  remainingWeekends: number;
  birthDate: string;
  targetAge: number;
}

/**
 * Calculate life-in-weeks metrics based on birth date and target age
 */
export function calculateLifeInWeeks(
  birthDate: string,
  targetAge: number
): LifeInWeeksData {
  const birth = new Date(birthDate);
  const today = new Date();
  const birthYear = birth.getFullYear();

  // Calculate weeks lived
  const msInWeek = 1000 * 60 * 60 * 24 * 7;
  const weeksLived = Math.floor((today.getTime() - birth.getTime()) / msInWeek);

  // Calculate total weeks based on target age
  const totalWeeks = Math.round(targetAge * 52);
  const weeksRemaining = Math.max(0, totalWeeks - weeksLived);
  const percentageLived = Math.min(100, Math.round((weeksLived / totalWeeks) * 100));

  // Calculate days lived
  const msInDay = 1000 * 60 * 60 * 24;
  const daysLived = Math.floor((today.getTime() - birth.getTime()) / msInDay);
  const yearsLived = daysLived / 365.25;

  // Calculate remaining summers and weekends
  const remainingSummers = Math.max(0, Math.floor(targetAge - yearsLived));
  const remainingWeekends = Math.max(0, Math.round(weeksRemaining));

  return {
    weeksLived,
    totalWeeks,
    weeksRemaining,
    percentageLived,
    daysLived,
    remainingSummers,
    remainingWeekends,
    birthDate,
    targetAge,
  };
}

/**
 * Get life-in-weeks data for a user from their profile
 * Returns null if birth_date or target_age is missing
 */
export function getLifeInWeeksDataForUser(
  birthDate: string | null,
  targetAge: number | null
): LifeInWeeksData | null {
  if (!birthDate || !targetAge) {
    return null;
  }

  return calculateLifeInWeeks(birthDate, targetAge);
}

