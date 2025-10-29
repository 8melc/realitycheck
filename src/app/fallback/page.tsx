import Link from 'next/link'

export default function FallbackPage() {
  return (
    <main className="min-h-screen bg-fyf-noir text-fyf-cream">
      <div className="flex min-h-screen">
        {/* Sidebar Navigation */}
        <aside className="w-80 bg-fyf-charcoal border-r border-fyf-smoke p-8">
          <div className="mb-12">
            <h1 className="font-display text-3xl font-bold mb-2 gradient-coral-mint bg-clip-text text-transparent">
              FYF
            </h1>
            <p className="text-sm text-fyf-steel">
              Website Übersicht
            </p>
          </div>
          
          <nav className="space-y-2">
            <h2 className="text-xs font-semibold text-fyf-steel uppercase tracking-wider mb-4">
              Hauptseiten
            </h2>
            <ul className="space-y-1">
              <li>
                <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-fyf-steel hover:bg-fyf-smoke hover:text-fyf-cream transition-all duration-200 group">
                  <span className="w-2 h-2 bg-fyf-coral rounded-full group-hover:scale-125 transition-transform"></span>
                  Hauptseite
                </Link>
              </li>
              <li>
                <Link href="/feedboard" className="flex items-center gap-3 px-3 py-2 rounded-lg text-fyf-steel hover:bg-fyf-smoke hover:text-fyf-cream transition-all duration-200 group">
                  <span className="w-2 h-2 bg-fyf-mint rounded-full group-hover:scale-125 transition-transform"></span>
                  Guide/Feedboard
                </Link>
              </li>
              <li>
                <Link href="/life-weeks" className="flex items-center gap-3 px-3 py-2 rounded-lg text-fyf-steel hover:bg-fyf-smoke hover:text-fyf-cream transition-all duration-200 group">
                  <span className="w-2 h-2 bg-fyf-coral rounded-full group-hover:scale-125 transition-transform"></span>
                  Life in Weeks
                </Link>
              </li>
              <li>
                <Link href="/people" className="flex items-center gap-3 px-3 py-2 rounded-lg text-fyf-steel hover:bg-fyf-smoke hover:text-fyf-cream transition-all duration-200 group">
                  <span className="w-2 h-2 bg-fyf-mint rounded-full group-hover:scale-125 transition-transform"></span>
                  People
                </Link>
              </li>
              <li>
                <Link href="/profile" className="flex items-center gap-3 px-3 py-2 rounded-lg text-fyf-steel hover:bg-fyf-smoke hover:text-fyf-cream transition-all duration-200 group">
                  <span className="w-2 h-2 bg-fyf-mauve rounded-full group-hover:scale-125 transition-transform"></span>
                  Profile
                </Link>
              </li>
              <li>
                <Link href="/access" className="flex items-center gap-3 px-3 py-2 rounded-lg text-fyf-steel hover:bg-fyf-smoke hover:text-fyf-cream transition-all duration-200 group">
                  <span className="w-2 h-2 bg-fyf-coral rounded-full group-hover:scale-125 transition-transform"></span>
                  Access
                </Link>
              </li>
            </ul>
            
            <h2 className="text-xs font-semibold text-fyf-steel uppercase tracking-wider mb-4 mt-8">
              Onboarding
            </h2>
            <ul className="space-y-1">
              <li>
                <Link href="/onboarding" className="flex items-center gap-3 px-3 py-2 rounded-lg text-fyf-steel hover:bg-fyf-smoke hover:text-fyf-cream transition-all duration-200 group">
                  <span className="w-2 h-2 bg-fyf-mint rounded-full group-hover:scale-125 transition-transform"></span>
                  Onboarding
                </Link>
              </li>
              <li>
                <Link href="/onboardingdone" className="flex items-center gap-3 px-3 py-2 rounded-lg text-fyf-steel hover:bg-fyf-smoke hover:text-fyf-cream transition-all duration-200 group">
                  <span className="w-2 h-2 bg-fyf-coral rounded-full group-hover:scale-125 transition-transform"></span>
                  Onboarding Done
                </Link>
              </li>
            </ul>
            
            <h2 className="text-xs font-semibold text-fyf-steel uppercase tracking-wider mb-4 mt-8">
              Info & Support
            </h2>
            <ul className="space-y-1">
              <li>
                <Link href="/transparenz" className="flex items-center gap-3 px-3 py-2 rounded-lg text-fyf-steel hover:bg-fyf-smoke hover:text-fyf-cream transition-all duration-200 group">
                  <span className="w-2 h-2 bg-fyf-mauve rounded-full group-hover:scale-125 transition-transform"></span>
                  Transparenz
                </Link>
              </li>
              <li>
                <Link href="/credits" className="flex items-center gap-3 px-3 py-2 rounded-lg text-fyf-steel hover:bg-fyf-smoke hover:text-fyf-cream transition-all duration-200 group">
                  <span className="w-2 h-2 bg-fyf-coral rounded-full group-hover:scale-125 transition-transform"></span>
                  Credits
                </Link>
              </li>
              <li>
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-fyf-cream bg-fyf-smoke">
                  <span className="w-2 h-2 bg-fyf-mint rounded-full"></span>
                  Diese Seite
                </div>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1 p-12">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-16">
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 text-fyf-cream">
                Website Übersicht
              </h1>
              <p className="text-lg text-fyf-steel max-w-2xl">
                Alle verfügbaren Seiten und Funktionen der FYF-App. Navigiere durch die Sidebar oder erkunde die detaillierten Beschreibungen unten.
              </p>
            </div>

            {/* Main Sections */}
            <div className="space-y-12">
              {/* Hauptseiten Section */}
              <section className="bg-fyf-charcoal rounded-xl p-8 border border-fyf-smoke">
                <h2 className="font-display text-2xl font-bold mb-6 text-fyf-cream">
                  Hauptseiten
                </h2>
                <p className="text-fyf-steel mb-8">
                  Die zentralen Funktionen und Bereiche der FYF-App
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Link href="/" className="group">
                    <div className="bg-fyf-smoke p-6 rounded-lg hover:bg-fyf-coral hover:text-fyf-noir transition-all duration-300 border border-fyf-smoke hover:border-fyf-coral">
                      <h3 className="font-display text-lg font-bold mb-2 group-hover:text-fyf-noir">
                        Hauptseite
                      </h3>
                      <p className="text-sm text-fyf-steel group-hover:text-fyf-noir/80">
                        Landing Page mit Sanduhr-Video und Life-in-Weeks Visualisierung
                      </p>
                      <div className="mt-2 text-xs font-mono text-fyf-mint group-hover:text-fyf-noir">
                        /
                      </div>
                    </div>
                  </Link>

                  <Link href="/feedboard" className="group">
                    <div className="bg-fyf-smoke p-6 rounded-lg hover:bg-fyf-mint hover:text-fyf-noir transition-all duration-300 border border-fyf-smoke hover:border-fyf-mint">
                      <h3 className="font-display text-lg font-bold mb-2 group-hover:text-fyf-noir">
                        Guide/Feedboard
                      </h3>
                      <p className="text-sm text-fyf-steel group-hover:text-fyf-noir/80">
                        AI-gestützte Empfehlungen und kuratierte Inhalte für dein Wachstum
                      </p>
                      <div className="mt-2 text-xs font-mono text-fyf-mint group-hover:text-fyf-noir">
                        /feedboard
                      </div>
                    </div>
                  </Link>

                  <Link href="/life-weeks" className="group">
                    <div className="bg-fyf-smoke p-6 rounded-lg hover:bg-fyf-coral hover:text-white transition-all duration-300 border border-fyf-smoke hover:border-fyf-coral">
                      <h3 className="font-display text-lg font-bold mb-2 group-hover:text-white">
                        Life in Weeks
                      </h3>
                      <p className="text-sm text-fyf-steel group-hover:text-white/80">
                        Visualisiere dein Leben in Wochen und verstehe die Kostbarkeit der Zeit
                      </p>
                      <div className="mt-2 text-xs font-mono text-fyf-mint group-hover:text-white">
                        /life-weeks
                      </div>
                    </div>
                  </Link>

                  <Link href="/people" className="group">
                    <div className="bg-fyf-smoke p-6 rounded-lg hover:bg-fyf-mint hover:text-fyf-noir transition-all duration-300 border border-fyf-smoke hover:border-fyf-mint">
                      <h3 className="font-display text-lg font-bold mb-2 group-hover:text-fyf-noir">
                        People
                      </h3>
                      <p className="text-sm text-fyf-steel group-hover:text-fyf-noir/80">
                        Entdecke Menschen, die zu dir passen und verbinde dich mit ihnen
                      </p>
                      <div className="mt-2 text-xs font-mono text-fyf-mint group-hover:text-fyf-noir">
                        /people
                      </div>
                    </div>
                  </Link>

                  <Link href="/profile" className="group">
                    <div className="bg-fyf-smoke p-6 rounded-lg hover:bg-fyf-mauve hover:text-white transition-all duration-300 border border-fyf-smoke hover:border-fyf-mauve">
                      <h3 className="font-display text-lg font-bold mb-2 group-hover:text-white">
                        Profile
                      </h3>
                      <p className="text-sm text-fyf-steel group-hover:text-white/80">
                        Dein persönliches Profil und Dashboard
                      </p>
                      <div className="mt-2 text-xs font-mono text-fyf-mint group-hover:text-white">
                        /profile
                      </div>
                    </div>
                  </Link>

                  <Link href="/access" className="group">
                    <div className="bg-fyf-smoke p-6 rounded-lg hover:bg-fyf-coral hover:text-white transition-all duration-300 border border-fyf-smoke hover:border-fyf-coral">
                      <h3 className="font-display text-lg font-bold mb-2 group-hover:text-white">
                        Access
                      </h3>
                      <p className="text-sm text-fyf-steel group-hover:text-white/80">
                        Erstelle dein Profil und werde Teil der FYF-Community
                      </p>
                      <div className="mt-2 text-xs font-mono text-fyf-mint group-hover:text-white">
                        /access
                      </div>
                    </div>
                  </Link>
                </div>
              </section>

              {/* Onboarding Flow Section */}
              <section className="bg-fyf-charcoal rounded-xl p-8 border border-fyf-smoke">
                <h2 className="font-display text-2xl font-bold mb-6 text-fyf-cream">
                  Onboarding Flow
                </h2>
                <p className="text-fyf-steel mb-8">
                  Der schrittweise Einstieg in die FYF-Community
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Link href="/onboarding" className="group">
                    <div className="bg-fyf-smoke p-6 rounded-lg hover:bg-fyf-mint hover:text-fyf-noir transition-all duration-300 border border-fyf-smoke hover:border-fyf-mint">
                      <h3 className="font-display text-lg font-bold mb-2 group-hover:text-fyf-noir">
                        Onboarding
                      </h3>
                      <p className="text-sm text-fyf-steel group-hover:text-fyf-noir/80">
                        Erstelle dein Profil und konfiguriere deine Präferenzen
                      </p>
                      <div className="mt-2 text-xs font-mono text-fyf-mint group-hover:text-fyf-noir">
                        /onboarding
                      </div>
                    </div>
                  </Link>

                  <Link href="/onboardingdone" className="group">
                    <div className="bg-fyf-smoke p-6 rounded-lg hover:bg-fyf-coral hover:text-white transition-all duration-300 border border-fyf-smoke hover:border-fyf-coral">
                      <h3 className="font-display text-lg font-bold mb-2 group-hover:text-white">
                        Onboarding Done
                      </h3>
                      <p className="text-sm text-fyf-steel group-hover:text-white/80">
                        Abschluss des Onboarding-Prozesses
                      </p>
                      <div className="mt-2 text-xs font-mono text-fyf-mint group-hover:text-white">
                        /onboardingdone
                      </div>
                    </div>
                  </Link>

                  <div className="bg-fyf-smoke p-6 rounded-lg border border-fyf-smoke opacity-60">
                    <h3 className="font-display text-lg font-bold mb-2 text-fyf-steel">
                      Dashboard
                    </h3>
                    <p className="text-sm text-fyf-steel">
                      Nach dem Onboarding gelangst du zum Hauptdashboard
                    </p>
                    <div className="mt-2 text-xs font-mono text-fyf-steel">
                      /profile
                    </div>
                  </div>
                </div>
              </section>

              {/* Info Pages Section */}
              <section className="bg-fyf-charcoal rounded-xl p-8 border border-fyf-smoke">
                <h2 className="font-display text-2xl font-bold mb-6 text-fyf-cream">
                  Info & Support
                </h2>
                <p className="text-fyf-steel mb-8">
                  Zusätzliche Informationen und Support-Bereiche
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Link href="/transparenz" className="group">
                    <div className="bg-fyf-smoke p-6 rounded-lg hover:bg-fyf-mauve hover:text-white transition-all duration-300 border border-fyf-smoke hover:border-fyf-mauve">
                      <h3 className="font-display text-lg font-bold mb-2 group-hover:text-white">
                        Transparenz
                      </h3>
                      <p className="text-sm text-fyf-steel group-hover:text-white/80">
                        Erfahre mehr über unsere Werte und finde Antworten auf häufige Fragen
                      </p>
                      <div className="mt-2 text-xs font-mono text-fyf-mint group-hover:text-white">
                        /transparenz
                      </div>
                    </div>
                  </Link>

                  <Link href="/credits" className="group">
                    <div className="bg-fyf-smoke p-6 rounded-lg hover:bg-fyf-coral hover:text-white transition-all duration-300 border border-fyf-smoke hover:border-fyf-coral">
                      <h3 className="font-display text-lg font-bold mb-2 group-hover:text-white">
                        Credits
                      </h3>
                      <p className="text-sm text-fyf-steel group-hover:text-white/80">
                        Credits und Danksagungen
                      </p>
                      <div className="mt-2 text-xs font-mono text-fyf-mint group-hover:text-white">
                        /credits
                      </div>
                    </div>
                  </Link>

                  <div className="bg-fyf-smoke p-6 rounded-lg border border-fyf-smoke">
                    <h3 className="font-display text-lg font-bold mb-2 text-fyf-cream">
                      Diese Seite
                    </h3>
                    <p className="text-sm text-fyf-steel">
                      Übersicht aller verfügbaren Seiten und Funktionen
                    </p>
                    <div className="mt-2 text-xs font-mono text-fyf-mint">
                      /fallback
                    </div>
                  </div>
                </div>
              </section>

              {/* Dynamic Routes Section */}
              <section className="bg-fyf-charcoal rounded-xl p-8 border border-fyf-smoke">
                <h2 className="font-display text-2xl font-bold mb-6 text-fyf-cream">
                  Dynamic Routes
                </h2>
                <p className="text-fyf-steel mb-8">
                  Dynamische Seiten mit variablen Parametern
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-fyf-smoke p-6 rounded-lg border border-fyf-smoke">
                    <h3 className="font-display text-lg font-bold mb-2 text-fyf-cream">
                      People Profile
                    </h3>
                    <p className="text-sm text-fyf-steel mb-2">
                      Dynamische Profile für einzelne Personen
                    </p>
                    <div className="text-xs font-mono text-fyf-mint mb-2">
                      /people/profile/[slug]
                    </div>
                    <p className="text-xs text-fyf-steel">
                      Beispiel: /people/profile/sarah-chen
                    </p>
                  </div>

                  <div className="bg-fyf-smoke p-6 rounded-lg border border-fyf-smoke">
                    <h3 className="font-display text-lg font-bold mb-2 text-fyf-cream">
                      Access Event
                    </h3>
                    <p className="text-sm text-fyf-steel mb-2">
                      Spezifische Event-Details im Access-Bereich
                    </p>
                    <div className="text-xs font-mono text-fyf-mint mb-2">
                      /access/[eventId]
                    </div>
                    <p className="text-xs text-fyf-steel">
                      Beispiel: /access/event-123
                    </p>
                  </div>
                </div>
              </section>
            </div>

            {/* Footer */}
            <footer className="mt-16 pt-8 border-t border-fyf-charcoal">
              <div className="flex justify-center gap-6">
                <Link href="/" className="text-fyf-steel hover:text-fyf-coral transition-colors">
                  Zurück zur Hauptseite
                </Link>
                <Link href="/transparenz" className="text-fyf-steel hover:text-fyf-coral transition-colors">
                  Transparenz
                </Link>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </main>
  );
}
