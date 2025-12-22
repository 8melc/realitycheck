'use client';

import Link from 'next/link';
import { TargetIcon, ClockIcon, GlobeIcon, MusicIcon } from '@/components/profile/icons';
import { 
  LightBulbIcon,
  RocketLaunchIcon,
  ChatBubbleLeftRightIcon,
  BellIcon
} from '@heroicons/react/24/outline';

interface TransparencyWidgetProps {
  userGoal: string | null;
  interests: string[];
  projects: string[];
  timePhilosophy: string;
  lifestyle: string;
  spotifyConnected: boolean;
  guideTone: 'straight' | 'soft';
  nudgingFrequency: string;
}

export default function TransparencyWidget({
  userGoal,
  interests,
  projects,
  timePhilosophy,
  lifestyle,
  spotifyConnected,
  guideTone,
  nudgingFrequency,
}: TransparencyWidgetProps) {
  return (
    <section className="guide-section" id="transparency-widget">
      <div className="rc-card rc-card--hero p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <span className="guide-kicker">So arbeitet dein Guide</span>
            <h3 className="rc-heading text-2xl">Was dein Guide aktuell weiß</h3>
            <p className="rc-microcopy mt-2">
              Deine Datenbasis für personalisierte Impulse
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Ziel */}
          <div className="data-point">
            <div className="flex items-center gap-2 mb-2">
              <TargetIcon className="w-5 h-5 text-[var(--fyf-steel)]" />
              <span className="text-[10px] font-bold uppercase text-[var(--fyf-steel)]">Ziel</span>
            </div>
            <p className="text-sm text-[var(--fyf-cream)]">
              {userGoal || "Noch nicht gesetzt"}
            </p>
          </div>

          {/* Interessen */}
          <div className="data-point">
            <div className="flex items-center gap-2 mb-2">
              <LightBulbIcon className="w-5 h-5 text-[var(--fyf-steel)]" />
              <span className="text-[10px] font-bold uppercase text-[var(--fyf-steel)]">Interessen</span>
            </div>
            <p className="text-sm text-[var(--fyf-cream)]">
              {interests.length > 0 ? `${interests.length} Themen` : "Keine"}
            </p>
            {interests.length > 0 && (
              <p className="text-xs text-[var(--fyf-steel)] mt-1">
                {interests.slice(0, 3).join(", ")}
                {interests.length > 3 && "..."}
              </p>
            )}
          </div>

          {/* Projekte */}
          <div className="data-point">
            <div className="flex items-center gap-2 mb-2">
              <RocketLaunchIcon className="w-5 h-5 text-[var(--fyf-steel)]" />
              <span className="text-[10px] font-bold uppercase text-[var(--fyf-steel)]">Projekte</span>
            </div>
            <p className="text-sm text-[var(--fyf-cream)]">
              {projects.length > 0 ? `${projects.length} aktiv` : "Keine"}
            </p>
            {projects.length > 0 && (
              <p className="text-xs text-[var(--fyf-steel)] mt-1">
                {projects.slice(0, 2).join(", ")}
                {projects.length > 2 && "..."}
              </p>
            )}
          </div>

          {/* Zeit-Philosophie */}
          <div className="data-point">
            <div className="flex items-center gap-2 mb-2">
              <ClockIcon className="w-5 h-5 text-[var(--fyf-steel)]" />
              <span className="text-[10px] font-bold uppercase text-[var(--fyf-steel)]">Zeit-Philosophie</span>
            </div>
            <p className="text-sm text-[var(--fyf-cream)]">
              {timePhilosophy || "Nicht gesetzt"}
            </p>
          </div>

          {/* Lebensstil */}
          <div className="data-point">
            <div className="flex items-center gap-2 mb-2">
              <GlobeIcon className="w-5 h-5 text-[var(--fyf-steel)]" />
              <span className="text-[10px] font-bold uppercase text-[var(--fyf-steel)]">Lebensstil</span>
            </div>
            <p className="text-sm text-[var(--fyf-cream)]">
              {lifestyle || "Nicht gesetzt"}
            </p>
          </div>

          {/* Musik-DNA */}
          <div className="data-point">
            <div className="flex items-center gap-2 mb-2">
              <MusicIcon className="w-5 h-5 text-[var(--fyf-steel)]" />
              <span className="text-[10px] font-bold uppercase text-[var(--fyf-steel)]">Musik-DNA</span>
            </div>
            <p className="text-sm text-[var(--fyf-cream)]">
              {spotifyConnected ? "✓ Verbunden" : "Nicht verbunden"}
            </p>
          </div>

          {/* Guide-Ton */}
          <div className="data-point">
            <div className="flex items-center gap-2 mb-2">
              <ChatBubbleLeftRightIcon className="w-5 h-5 text-[var(--fyf-steel)]" />
              <span className="text-[10px] font-bold uppercase text-[var(--fyf-steel)]">Guide-Ton</span>
            </div>
            <p className="text-sm text-[var(--fyf-cream)]">
              {guideTone === 'straight' ? 'Straight Talk' : 'Soft Touch'}
            </p>
          </div>

          {/* Nudging-Frequenz */}
          <div className="data-point">
            <div className="flex items-center gap-2 mb-2">
              <BellIcon className="w-5 h-5 text-[var(--fyf-steel)]" />
              <span className="text-[10px] font-bold uppercase text-[var(--fyf-steel)]">Nudging</span>
            </div>
            <p className="text-sm text-[var(--fyf-cream)]">
              {nudgingFrequency || "Standard"}
            </p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-white/10">
          <Link 
            href="/user/settings/guide" 
            className="text-[var(--fyf-mint)] hover:underline text-xs uppercase font-bold inline-flex items-center gap-2"
          >
            Einstellungen öffnen →
          </Link>
        </div>
      </div>
    </section>
  );
}


