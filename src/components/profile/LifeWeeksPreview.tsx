'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useGuideStore } from '@/stores/guideStore';
import { getGuideText } from '@/lib/guideTone';

interface LifeWeeksPreviewProps {
  profile: {
    identity: {
      birthdate: string;
      targetAge: number;
    };
  };
}

export default function LifeWeeksPreview({ profile }: LifeWeeksPreviewProps) {
  const [timeMetrics, setTimeMetrics] = useState({
    weeksLived: 0,
    weeksRemaining: 0,
    totalWeeks: 0,
  });
  const [isClient, setIsClient] = useState(false);
  const { tone } = useGuideStore();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    
    const birthDate = new Date(profile.identity.birthdate);
    const today = new Date();
    const targetAge = profile.identity.targetAge || 80;

    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    const weeksLived = Math.max(0, Math.floor((today.getTime() - birthDate.getTime()) / msPerWeek));
    const totalWeeks = targetAge * 52;
    const weeksRemaining = Math.max(0, totalWeeks - weeksLived);

    setTimeMetrics({ weeksLived, weeksRemaining, totalWeeks });
  }, [profile, isClient]);

  // Calculate grid dimensions
  const weeksPerRow = 80;
  const totalRows = Math.ceil(timeMetrics.totalWeeks / weeksPerRow);
  const totalCells = weeksPerRow * totalRows;

  return (
    <div className="rc-card">
        <div className="rc-card-header">
          <span className="rc-kicker">Quick Access</span>
          <h2 className="rc-subheading">{getGuideText('lifeWeeksTitle', tone)}</h2>
          <p className="rc-microcopy">{getGuideText('lifeWeeksSubtitle', tone)}</p>
        </div>

      <div className="life-weeks-preview-content">
        {/* Mini Grid Preview */}
        <div className="life-weeks-mini-grid" role="img" aria-label="Life in Weeks Preview">
          <div 
            className="weeks-grid-preview"
            style={{
              gridTemplateColumns: `repeat(${weeksPerRow}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: totalCells }).map((_, i) => {
              const isPast = i < timeMetrics.weeksLived;
              const isCurrent = i === timeMetrics.weeksLived;
              const isFuture = i > timeMetrics.weeksLived && i < timeMetrics.totalWeeks;
              
              let className = 'week-dot-preview';
              if (isPast) className += ' week-past';
              else if (isCurrent) className += ' week-current';
              else if (isFuture) className += ' week-future';
              else className += ' week-empty';

              return <div key={i} className={className} />;
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="life-weeks-stats">
          <div className="stat-item">
            <span className="stat-number">
              {isClient ? timeMetrics.weeksLived.toLocaleString() : '...'}
            </span>
            <span className="stat-label">Wochen gelebt</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {isClient ? timeMetrics.weeksRemaining.toLocaleString() : '...'}
            </span>
            <span className="stat-label">Wochen übrig</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="life-weeks-action">
          <Link href="/life-weeks" className="rc-btn rc-btn--primary">
            Life Weeks öffnen
          </Link>
        </div>
      </div>
    </div>
  );
}