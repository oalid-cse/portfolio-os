import type { PortfolioData } from '@/content/types';

export const portfolioFixture: PortfolioData = {
  profile: {
    name: 'Abu Bin Oalid',
    title: 'Senior Backend Engineer',
    tagline: 'Building reliable backends.',
    summary: 'Backend engineer focused on PHP and Laravel systems.',
    location: 'Dhaka, Bangladesh',
    yearsOfExperience: 7,
    availability: 'open',
    email: 'hello@example.com',
    avatar: '/images/profile.jpg',
    resumePdf: '/resume/abu-bin-oalid.pdf',
    socials: [
      { label: 'GitHub', url: 'https://github.com/example', icon: 'github' },
      { label: 'LinkedIn', url: 'https://linkedin.com/in/example', icon: 'linkedin' },
    ],
  },
  skills: [
    { id: 'backend', label: 'Backend', skills: ['PHP', 'Laravel'] },
    { id: 'data', label: 'Data', skills: ['MySQL', 'Redis'] },
  ],
  experience: [
    { id: 'alpha', company: 'Alpha Co', role: 'Senior Engineer', location: 'Remote', start: '2023-01', end: 'present', highlights: ['Led API work'] },
    { id: 'beta', company: 'Beta Ltd', role: 'Engineer', location: 'Dhaka', start: '2020-02', end: '2022-12', highlights: ['Built billing'] },
    { id: 'gamma', company: 'Gamma Inc', role: 'Junior Engineer', location: 'Dhaka', start: '2018-06', end: '2020-01', highlights: ['Fixed bugs'] },
  ],
  education: [{ id: 'uni', institution: 'Example University', degree: 'BSc Computer Science', location: 'Dhaka', start: '2014', end: '2018' }],
  projects: [
    {
      slug: 'alhisab',
      title: 'Alhisab',
      summary: 'Accounting platform.',
      tech: ['Laravel', 'MySQL'],
      role: 'Lead',
      year: 2024,
      featured: true,
      order: 1,
      links: { live: 'https://example.com/alhisab' },
      metrics: [{ label: 'Users', value: '1k' }],
    },
    { slug: 'beta-app', title: 'Beta App', summary: 'Second project.', tech: [], role: 'Dev', year: 2022, featured: false, order: 2 },
  ],
  posts: [],
  features: { contactForm: false },
};
