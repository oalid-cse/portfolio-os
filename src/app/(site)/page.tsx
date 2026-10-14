import { getProfile } from '@/lib/content';

export default async function HomePage() {
  const profile = await getProfile();
  return <h1 className="py-24 text-4xl font-semibold tracking-tight">{profile.name}</h1>;
}
