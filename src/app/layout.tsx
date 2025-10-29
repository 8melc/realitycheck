import type { Metadata } from 'next'
import { Inter, Space_Grotesk, Righteous, Roboto_Mono } from 'next/font/google'
import './globals.css'
import CookieConsentBanner from '../components/CookieConsentBanner'
import HeaderNav from '../components/HeaderNav'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  variable: '--font-space-grotesk',
})

const righteous = Righteous({ 
  subsets: ['latin'],
  weight: '400',
  variable: '--font-righteous',
})

const robotoMono = Roboto_Mono({ 
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-roboto-mono',
})

export const metadata: Metadata = {
  title: 'Reality Check - Fuck Your Future',
  description: 'Transform your life with Reality Check - Life visualization, goal setting, and personal development tools.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${righteous.variable} ${robotoMono.variable}`}>
      <body className="font-body bg-realitycheck-noir text-realitycheck-cream antialiased">
        <HeaderNav />
        <main>
          {children}
        </main>
        
        {/* Global Footer */}
        <footer className="landing-footer">
          <div className="footer-container">
            {/* Reality Check Column */}
            <div className="footer-column">
              <h3>Reality Check</h3>
              <ul>
                <li><a href="/feedboard">Guide</a></li>
                <li><a href="/people">People</a></li>
                <li><a href="/access">Access</a></li>
              </ul>
            </div>
            
            {/* About us Column */}
            <div className="footer-column">
              <h3>About us</h3>
              <ul>
                <li><a href="/transparenz">Transparenz</a></li>
                <li><a href="/credits">Credits</a></li>
                <li><a href="mailto:hello@realitycheck.studio">Kontakt</a></li>
              </ul>
            </div>
          </div>
          
          <div className="footer-copyright">
            © 2025 Reality Check Studio. Alle Rechte vorbehalten.
          </div>
        </footer>
        
        <CookieConsentBanner />
      </body>
    </html>
  )
}
