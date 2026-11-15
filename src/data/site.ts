// Language-independent site facts (single locale: en).
export const SITE = {
  title: 'Mateo Olaya Bernal',
  url: 'https://molayab.com',
  author: 'Mateo Olaya Bernal',
  description:
    'Technical notes, release notes, and articles on Swift, iOS, macOS, and backend engineering.',
  twitter: '@molayab_',
  defaultImage: '/og-image.png',
  themeColor: { light: '#F6F5F0', dark: '#000000' },
} as const;

export const absoluteUrl = (path: string) => new URL(path, SITE.url + '/').toString();
