import { describe, expect, it } from 'vitest';
import { getPortfolioData, getProjects } from './content';

describe('real content', () => {
  it('loads the 5 CV projects in order', async () =>
    expect((await getProjects()).map((p) => p.slug)).toEqual([
      '6ammart',
      'ajaxerp',
      'alhisab',
      'rebusel',
      'gpsfreelancer',
    ]));

  it('getPortfolioData is JSON-serializable', async () => {
    const d = await getPortfolioData();
    expect(JSON.parse(JSON.stringify(d))).toEqual(d);
  });
});
