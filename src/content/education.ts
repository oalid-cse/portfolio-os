import { z } from 'zod';
import { educationSchema } from './schemas';

const education = z.array(educationSchema).parse([
  {
    id: 'barguna-polytechnic',
    institution: 'Barguna Polytechnic Institute',
    degree: 'Diploma in Computer Technology',
    location: 'Barguna, Barishal, Bangladesh',
    start: '2013-07',
    end: '2017-06',
    grade: 'CGPA 3.41 / 4.00',
  },
  {
    id: 'mahimagonj-high-school',
    institution: 'Mahimagonj High School, Gobindogonj',
    degree: 'Secondary School Certificate',
    location: 'Gaibandha, Bangladesh',
    end: '2013',
    grade: 'GPA 4.44 / 5.00',
  },
]);

export default education;
