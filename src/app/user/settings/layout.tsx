'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { settingsNavConfig } from './settingsNavConfig';
import './settings.css';

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const pathname = usePathname();

  const handleSectionClick = (e: React.MouseEvent<HTMLAnchorElement>, anchor: string) => {
    e.preventDefault();
    const element = document.querySelector(anchor);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Update URL without reload
      window.history.pushState(null, '', `${pathname}${anchor}`);
    }
  };

  return (
    <div className="settings-shell">
      <aside className="settings-sidebar">
        <nav className="settings-nav">
          <h2 className="settings-nav-title">Einstellungen</h2>
          <ul className="settings-nav-list">
            {settingsNavConfig.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`settings-nav-link ${isActive ? 'active' : ''}`}
                  >
                    {item.label}
                  </Link>
                  {isActive && item.sections && item.sections.length > 0 && (
                    <ul className="settings-nav-sublist">
                      {item.sections.map((section) => (
                        <li key={section.anchor}>
                          <a
                            href={`${item.href}${section.anchor}`}
                            onClick={(e) => section.anchor && handleSectionClick(e, section.anchor)}
                            className="settings-nav-sublink"
                          >
                            {section.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
      <main className="settings-main-content">
        {children}
      </main>
    </div>
  );
}

