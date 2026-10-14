import { profileSchema } from './schemas';

const profile = profileSchema.parse({
  name: 'Abu Bin Oalid',
  title: 'Senior Backend Engineer',
  // TODO(owner): confirm wording
  tagline: 'I design scalable, multi-tenant backend systems with PHP & Laravel.',
  summary:
    'Senior Backend Engineer (PHP/Laravel) with 7+ years of experience designing scalable, multi-tenant, and high-performance systems. Proven expertise in optimizing backend services, architecting modular applications, and leading development teams. Experienced in AWS, CI/CD pipelines, and real-time systems.',
  location: 'Dhaka, Bangladesh',
  yearsOfExperience: 7,
  // TODO(owner): confirm
  availability: 'open',
  email: 'oalid.mmj@gmail.com',
  phone: '+8801719134842',
  avatar: '/images/profile.jpg',
  resumePdf: '/resume/abu-bin-oalid.pdf',
  socials: [
    { label: 'LinkedIn', url: 'https://linkedin.com/in/abu-bin-oalid', icon: 'linkedin' },
    { label: 'GitHub', url: 'https://github.com/oalid-cse', icon: 'github' },
    { label: 'WhatsApp', url: 'https://wa.me/8801719134842', icon: 'whatsapp' },
  ],
});

export default profile;
