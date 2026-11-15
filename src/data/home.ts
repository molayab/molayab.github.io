// Homepage content that is not a blog post. Repo stars and descriptions are
// hardcoded on purpose: update them here when they change on GitHub.
export interface Repo {
  name: string;
  description: string;
  stars: number;
  language: string;
  languageColor: string;
}

const SWIFT = { language: 'Swift', languageColor: '#F05138' };

export const REPOS: Repo[] = [
  { name: 'swift-ai-provider-kit', description: 'Provider-agnostic Swift package for Claude, OpenAI, and on-device AI.', stars: 1, ...SWIFT },
  { name: 'ios-musicplayer', description: 'Third-party alternative to the native iOS Music app.', stars: 12, ...SWIFT },
  { name: 'swift-cli-manager', description: 'Git-backed manager for CLI and AI agent configurations.', stars: 3, ...SWIFT },
  { name: 'swift-front-arch', description: 'SOLID-based architecture patterns for Apple platform apps.', stars: 3, ...SWIFT },
  { name: 'vapor-ecommerce', description: 'Headless e-commerce manager built with Vapor and Swift.', stars: 2, ...SWIFT },
  { name: 'swift-background-scheduler', description: 'Actor-based task scheduler for immediate, delayed, and periodic work.', stars: 1, ...SWIFT },
  { name: 'calling-swift-from-c', description: 'Calling a Swift-built library from C, with responses passed back.', stars: 1, ...SWIFT },
];

export const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://molayab.com/#website',
      name: 'Mateo Olaya Bernal',
      url: 'https://molayab.com/',
      inLanguage: 'en',
      publisher: { '@id': 'https://molayab.com/#person' },
    },
    {
      '@type': 'Person',
      '@id': 'https://molayab.com/#person',
      name: 'Mateo Olaya Bernal',
      url: 'https://molayab.com/',
      image: 'https://github.com/molayab.png',
      email: 'mailto:hello@molayab.com',
      jobTitle: 'Software Engineer',
      description:
        'Software engineer building native Swift apps for macOS and iOS, backend services with Vapor, and open-source developer tools.',
      sameAs: ['https://github.com/molayab', 'https://x.com/molayab_', 'https://instagram.com/molayab'],
      knowsAbout: ['Swift', 'iOS', 'macOS', 'Vapor', 'Backend Development'],
    },
  ],
};
