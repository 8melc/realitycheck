export interface SettingsNavSection {
  href: string;
  label: string;
  anchor?: string;
}

export interface SettingsNavItem {
  href: string;
  label: string;
  sections?: SettingsNavSection[];
}

export const settingsNavConfig: SettingsNavItem[] = [
  {
    href: '/user/settings/ziel',
    label: 'Ziel & Leben',
    sections: [
      { href: '/user/settings/ziel', label: 'Aktuelles Ziel', anchor: '#ziel' },
      { href: '/user/settings/ziel', label: 'Interessen', anchor: '#interessen' },
      { href: '/user/settings/ziel', label: 'Projekte', anchor: '#projekte' },
    ],
  },
  {
    href: '/user/settings/guide',
    label: 'Guide',
    sections: [
      { href: '/user/settings/guide', label: 'Guide-Verhalten', anchor: '#guide-verhalten' },
      { href: '/user/settings/guide', label: 'Content-Filter', anchor: '#filter' },
      { href: '/user/settings/guide', label: 'Tageslimit', anchor: '#tageslimit' },
    ],
  },
  {
    href: '/user/settings/credits',
    label: 'Credits',
    sections: [
      { href: '/user/settings/credits', label: 'Aktueller Stand', anchor: '#aktueller-stand' },
      { href: '/user/settings/credits', label: 'Transaktionshistorie', anchor: '#transaktionen' },
      { href: '/user/settings/credits', label: 'Credits-System', anchor: '#credits-system' },
      { href: '/user/settings/credits', label: 'Credits kaufen', anchor: '#credits-kaufen' },
    ],
  },
  {
    href: '/user/settings/account',
    label: 'Account',
    sections: [
      { href: '/user/settings/account', label: 'Basis-Informationen', anchor: '#basis' },
      { href: '/user/settings/account', label: 'Profilbild', anchor: '#profilbild' },
      { href: '/user/settings/account', label: 'Passwort ändern', anchor: '#passwort' },
      { href: '/user/settings/account', label: 'Account löschen', anchor: '#account-loeschen' },
    ],
  },
];

