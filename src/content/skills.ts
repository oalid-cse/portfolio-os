import { z } from 'zod';
import { skillGroupSchema } from './schemas';

const skillGroups = z.array(skillGroupSchema).parse([
  { id: 'backend', label: 'Backend', skills: ['PHP', 'Laravel', 'REST API'] },
  { id: 'frontend', label: 'Frontend', skills: ['JavaScript', 'React', 'jQuery'] },
  { id: 'database', label: 'Database', skills: ['MySQL', 'MongoDB', 'Query Optimization'] },
  { id: 'devops', label: 'DevOps', skills: ['AWS (EC2, S3, RDS)', 'DigitalOcean', 'CI/CD (GitHub Actions)'] },
  { id: 'realtime', label: 'Realtime', skills: ['WebSocket', 'Live Chat', 'Notifications'] },
  { id: 'architecture', label: 'Architecture', skills: ['Multi-tenant systems', 'Scalable applications'] },
  {
    id: 'ai',
    label: 'AI-Assisted Development',
    skills: [
      'GitHub Copilot',
      'Cursor',
      'Antigravity',
      'Prompt engineering for code generation and debugging',
      'Automated code scaffolding, refactoring, and test generation',
    ],
  },
]);

export default skillGroups;
