import { z } from 'zod';
import { experienceSchema } from './schemas';

// Newest first.
const experience = z.array(experienceSchema).parse([
  {
    id: '6amtech',
    company: '6amTech',
    role: 'Senior Software Engineer',
    location: 'Dhaka, Bangladesh',
    start: '2025-03',
    end: '2026-03',
    highlights: [
      'Led development of a multi-vendor eCommerce platform',
      'Led development of an ERP',
      'Designed scalable backend architecture',
      'Improved performance and ensured system reliability',
    ],
  },
  {
    id: 'retinasoft',
    company: 'RetinaSoft',
    role: 'Software Engineer',
    location: 'Dhaka, Bangladesh',
    start: '2020-10',
    end: '2025-02',
    highlights: [
      'Built ERP system (HRM, Payroll, Accounting)',
      'Implemented real-time chat, notifications and Video calling',
      'Optimized server and database queries to improve performance',
      'Developed and maintained a full-featured Accounting Management System',
      'Handled high traffic users efficiently',
    ],
  },
  {
    id: 'igl-web',
    company: 'IGL Web Ltd',
    role: 'Web Developer (Backend)',
    location: 'Dhaka, Bangladesh',
    start: '2018-07',
    end: '2020-07',
    highlights: ['Migrated legacy PHP systems to Laravel', 'Worked on SMS and travel management systems'],
  },
]);

export default experience;
