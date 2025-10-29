'use client';

import { FormEvent, useState } from 'react';

type HeroMetric = {
  label: string;
  value: string;
  hint?: string;
};

export type HeroProps = {
  overline?: string;
  headline: string;
  subheadline?: string;
  description?: string;
  ctaLabel: string;
  ctaHref: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  metrics?: HeroMetric[];
  birthdateLabel?: string;
  targetAgeLabel?: string;
  submitLabel?: string;
  onSubmit?: (payload: { birthdate: string; targetAge?: string }) => void;
};

export function Hero({
  overline = 'FYF Studio',
  headline,
  subheadline,
  description,
  ctaLabel,
  ctaHref,
  secondaryCtaLabel,
  secondaryCtaHref,
  metrics = [],
  birthdateLabel = 'Geburtsdatum',
  targetAgeLabel = 'Zielalter',
  submitLabel = 'Berechnen',
  onSubmit,
}: HeroProps) {
  const [birthdate, setBirthdate] = useState('');
  const [targetAge, setTargetAge] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit?.({
      birthdate,
      targetAge: targetAge.trim() ? targetAge.trim() : undefined,
    });
  };

  return (
    <section className="relative isolate overflow-hidden bg-fyf-noir">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-fyf-charcoal/60 via-fyf-noir to-fyf-carbon blur-3xl opacity-60" />
      <div className="container mx-auto flex flex-col gap-16 px-6 py-16 lg:flex-row lg:items-center lg:justify-between lg:py-24">
        <div className="max-w-2xl space-y-6">
          {overline ? (
            <p className="text-sm uppercase tracking-[0.4em] text-fyf-steel">
              {overline}
            </p>
          ) : null}
          <h1 className="font-display text-4xl tracking-tight text-fyf-cream sm:text-5xl lg:text-6xl">
            {headline}
          </h1>
          {subheadline ? (
            <p className="font-display text-xl text-fyf-mint sm:text-2xl">
              {subheadline}
            </p>
          ) : null}
          {description ? (
            <p className="text-lg text-fyf-steel">{description}</p>
          ) : null}

          <div className="flex flex-wrap items-center gap-4">
            <a
              href={ctaHref}
              className="rounded-full bg-fyf-coral px-6 py-3 text-sm font-semibold text-fyf-noir transition hover:bg-fyf-coral-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fyf-coral"
            >
              {ctaLabel}
            </a>
            {secondaryCtaLabel && secondaryCtaHref ? (
              <a
                href={secondaryCtaHref}
                className="rounded-full border border-fyf-mint px-6 py-3 text-sm font-semibold text-fyf-mint transition hover:border-fyf-mint-dark hover:text-fyf-mint-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fyf-mint"
              >
                {secondaryCtaLabel}
              </a>
            ) : null}
          </div>
        </div>

        <div className="w-full max-w-md space-y-6 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label
                htmlFor="hero-birthdate"
                className="text-sm font-semibold text-fyf-cream"
              >
                {birthdateLabel}
              </label>
              <input
                id="hero-birthdate"
                name="birthdate"
                type="date"
                value={birthdate}
                onChange={(event) => setBirthdate(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-fyf-noir/70 px-4 py-3 text-sm text-fyf-cream placeholder:text-fyf-steel focus:border-fyf-mint focus:outline-none focus:ring-2 focus:ring-fyf-mint"
                placeholder="TT.MM.JJJJ"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="hero-target-age"
                className="text-sm font-semibold text-fyf-cream"
              >
                {targetAgeLabel}
              </label>
              <input
                id="hero-target-age"
                name="targetAge"
                type="number"
                min="30"
                max="120"
                value={targetAge}
                onChange={(event) => setTargetAge(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-fyf-noir/70 px-4 py-3 text-sm text-fyf-cream placeholder:text-fyf-steel focus:border-fyf-mint focus:outline-none focus:ring-2 focus:ring-fyf-mint"
                placeholder="z. B. 95"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-full bg-fyf-mint px-6 py-3 text-sm font-semibold text-fyf-noir transition hover:bg-fyf-mint-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fyf-mint"
            >
              {submitLabel}
            </button>
          </form>

          {metrics.length ? (
            <div className="grid grid-cols-2 gap-4">
              {metrics.map(({ label, value, hint }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/10 bg-fyf-noir/60 p-4"
                >
                  <p className="text-xs uppercase tracking-[0.3em] text-fyf-steel">
                    {label}
                  </p>
                  <p className="mt-2 font-display text-2xl text-fyf-cream">
                    {value}
                  </p>
                  {hint ? (
                    <p className="mt-1 text-xs text-fyf-steel/80">{hint}</p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default Hero;
