import Navigation from './components/Navigation';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-fyf-noir text-fyf-cream overflow-x-hidden">

      {/* Hero Section with Gradient Overlay */}
      <section className="relative min-h-screen">
        {/* Background Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-fyf-charcoal/40 via-fyf-noir to-fyf-carbon/60"></div>
        
        {/* Content mit vertikaler Verteilung */}
        <div className="relative z-10 flex flex-col min-h-screen px-6 md:px-20 py-8 md:py-[30px]">
          <Navigation active="home" />
          
          {/* Main Content Area */}
          <div className="flex-1 flex items-center justify-center">
            <div className="max-w-4xl text-center space-y-8">
              {/* Main Headline */}
              <h1 className="font-righteous text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.9] text-fyf-cream tracking-tight">
                Zeit = Vermögen<br />
                <span className="bg-gradient-to-r from-fyf-coral to-fyf-mint bg-clip-text text-transparent">
                  diese Wochen
                </span>
              </h1>
              
              {/* Value Proposition */}
              <div className="space-y-4">
                <p className="font-roboto-mono text-fyf-steel text-lg md:text-xl max-w-2xl mx-auto leading-relaxed opacity-90">
                  Jede Woche, die du lebst, zählt. Erfahre, wie viele wirklich bleiben.
                </p>
                <p className="font-righteous text-fyf-cream text-base md:text-lg max-w-xl mx-auto leading-relaxed">
                  Du machst Zeit zu deinem Vermögen
                </p>
              </div>
              
              {/* Haupt-CTA */}
              <a 
                href="/login"
                className="inline-flex items-center justify-center bg-fyf-mint text-fyf-noir font-bold text-lg px-12 py-5 rounded-full shadow-xl hover:shadow-2xl hover:shadow-fyf-mint/25 hover:scale-105 transition-all duration-500 font-righteous tracking-[0.05em]"
              >
                Deine Zeit entdecken
              </a>
            </div>
          </div>
          
          {/* Unterer Bereich: Meta-Box + Secondary CTA */}
          <div className="flex md:flex-row flex-col items-end md:items-center justify-between gap-8 md:gap-[40px]">
            {/* Meta-Info Box */}
            <div className="bg-[rgba(29,29,29,0.9)] rounded-[8px] p-[16px] flex md:flex-row flex-col md:gap-[40px] gap-[30px]">
              
              {/* Meta Item 1: Mission */}
              <div className="flex flex-col gap-[10px] text-fyf-cream">
                <h2 className="font-roboto-mono text-[14px] leading-[0.9] tracking-tight uppercase">
                  Mission
                </h2>
                <p className="font-roboto-mono text-[14px] leading-[0.9] opacity-80">
                  Zeit als Vermögen verstehen
                </p>
              </div>
              
              {/* Meta Item 2: Fokus */}
              <div className="flex flex-col gap-[10px] text-fyf-cream">
                <h2 className="font-roboto-mono text-[14px] leading-[0.9] tracking-tight uppercase">
                  Fokus
                </h2>
                <p className="font-roboto-mono text-[14px] leading-[0.9] opacity-80">
                  Deine verbleibenden Wochen
                </p>
              </div>
              
              {/* Meta Item 3: Start */}
              <div className="flex flex-col gap-[10px] text-fyf-cream">
                <h2 className="font-roboto-mono text-[14px] leading-[0.9] tracking-tight uppercase">
                  Start
                </h2>
                <p className="font-roboto-mono text-[14px] leading-[0.9] opacity-80">
                  Jetzt verfügbar
                </p>
              </div>
              
            </div>
            
            {/* Secondary CTA */}
            <a 
              href="/login"
              className="bg-[#95FF8D] text-fyf-noir font-roboto-mono font-medium text-[16px] uppercase tracking-tight px-[19px] py-[12px] rounded-[24.5px] hover:bg-[#95FF8D]/90 transition"
            >
              Mit Geburtsdatum starten
            </a>
          </div>
          
        </div>
      </section>

      {/* Secondary Content Section */}
      <section className="py-32 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-12">
          
          {/* Quote/Philosophy */}
          <div className="space-y-8">
            <blockquote className="font-righteous text-2xl md:text-3xl text-fyf-cream leading-relaxed">
              "Zeit ist das einzige, was wir haben.<br />
              Aber nie genug."
            </blockquote>
            
            <p className="font-roboto-mono text-fyf-steel/70 text-sm tracking-[0.1em] uppercase">
              — FYF Philosophy
            </p>
          </div>

          {/* Feature Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-16">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-fyf-coral/20 rounded-full flex items-center justify-center mx-auto">
                <span className="text-fyf-coral text-xl">⏰</span>
              </div>
              <h3 className="font-righteous text-lg text-fyf-cream">Life in Weeks</h3>
              <p className="font-roboto-mono text-fyf-steel/70 text-sm leading-relaxed">
                Visualisiere dein Leben in Wochen und verstehe die Kostbarkeit der Zeit.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="w-12 h-12 bg-fyf-mint/20 rounded-full flex items-center justify-center mx-auto">
                <span className="text-fyf-mint text-xl">🎯</span>
              </div>
              <h3 className="font-righteous text-lg text-fyf-cream">Bewusste Ziele</h3>
              <p className="font-roboto-mono text-fyf-steel/70 text-sm leading-relaxed">
                Setze klare Ziele und investiere deine verbleibende Zeit bewusst.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="w-12 h-12 bg-fyf-coral/20 rounded-full flex items-center justify-center mx-auto">
                <span className="text-fyf-coral text-xl">👥</span>
              </div>
              <h3 className="font-righteous text-lg text-fyf-cream">Deine Menschen</h3>
              <p className="font-roboto-mono text-fyf-steel/70 text-sm leading-relaxed">
                Finde und verbinde dich mit Menschen, die zu dir passen.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto text-center opacity-60">
          <p className="font-roboto-mono text-fyf-steel/50 text-xs tracking-[0.15em] uppercase">
            FYF Studio 2025 · <a href="mailto:hello@fyf.studio" className="hover:text-fyf-cream transition-colors">Kontakt</a> · <a href="/access" className="hover:text-fyf-cream transition-colors">Access</a>
          </p>
        </div>
      </footer>

      {/* Hidden Development Notes */}
      <div className="hidden">
        {/* Editorial Notes:
            - Consider adding subtle animation to the gradient text
            - Maybe add a subtle parallax effect to the background
            - Consider adding a subtle glow effect to the main CTA on hover
            - Think about adding a subtle typewriter effect to the headline
            - Consider adding a subtle fade-in animation for the content blocks
        */}
      </div>

    </div>
  );
}