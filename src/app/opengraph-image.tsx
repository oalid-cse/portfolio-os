import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ImageResponse } from 'next/og';
import { getProfile } from '@/lib/content';

export const runtime = 'nodejs';
export const alt = 'Abu Bin Oalid · Senior Backend Engineer';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpenGraphImage() {
  const profile = await getProfile();
  const file = await readFile(path.join(process.cwd(), 'public', profile.avatar));
  const avatar = `data:image/jpeg;base64,${file.toString('base64')}`;
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 56,
          padding: 80,
          background: '#0a0a0b',
          color: '#e6edf3',
        }}
      >
        <img src={avatar} alt="" width={280} height={280} style={{ borderRadius: 140, objectFit: 'cover' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 76, fontWeight: 700 }}>{profile.name}</div>
          <div style={{ fontSize: 40, color: '#8b98a5' }}>{profile.title}</div>
          <div style={{ fontSize: 30, color: '#22d3ee', marginTop: 16 }}>
            {`${profile.yearsOfExperience}+ years · PHP · Laravel · AWS`}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
