import { afterEach, describe, expect, it, vi } from 'vitest';
import { type DetectInput, detectOs, osDisplayName, readDetectInput } from './os-detect';

const WIN_CHROME =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';
const WIN_EDGE = `${WIN_CHROME} Edg/130.0.0.0`;
const WIN_FIREFOX =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0';
const MAC_SAFARI =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15';
const IPHONE_SAFARI =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
const IPAD_SAFARI =
  'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
const SAMSUNG_INTERNET =
  'Mozilla/5.0 (Linux; Android 14; SAMSUNG SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/25.0 Chrome/121.0.0.0 Mobile Safari/537.36';
const SAMSUNG_CHROME =
  'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36';
const PIXEL_CHROME =
  'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36';
const UBUNTU_FIREFOX =
  'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:132.0) Gecko/20100101 Firefox/132.0';
const GOOGLEBOT =
  'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';

const cases: ReadonlyArray<readonly [string, DetectInput, ReturnType<typeof detectOs>]> = [
  ['Windows Chrome, platformVersion 15', { userAgent: WIN_CHROME, platformVersion: '15.0.0' }, 'windows11'],
  ['Windows Edge, platformVersion 13', { userAgent: WIN_EDGE, platformVersion: '13.0.0' }, 'windows11'],
  ['Windows Chrome, platformVersion 10', { userAgent: WIN_CHROME, platformVersion: '10.0.0' }, 'windows10'],
  ['Windows Firefox, no platformVersion', { userAgent: WIN_FIREFOX }, 'windows'],
  ['Windows UA, garbage platformVersion', { userAgent: WIN_CHROME, platformVersion: 'garbage' }, 'windows'],
  ['Mac Safari, no touch', { userAgent: MAC_SAFARI, maxTouchPoints: 0 }, 'macos'],
  ['Mac Safari, 5 touch points', { userAgent: MAC_SAFARI, maxTouchPoints: 5 }, 'ipad'],
  ['iPad UA', { userAgent: IPAD_SAFARI }, 'ipad'],
  ['iPhone Safari', { userAgent: IPHONE_SAFARI, maxTouchPoints: 5 }, 'iphone'],
  ['Samsung Internet', { userAgent: SAMSUNG_INTERNET }, 'samsung'],
  ['Chrome on SM-S918B', { userAgent: SAMSUNG_CHROME }, 'samsung'],
  ['Pixel Chrome', { userAgent: PIXEL_CHROME }, 'android'],
  ['Ubuntu Firefox', { userAgent: UBUNTU_FIREFOX }, 'linux'],
  ['empty UA', { userAgent: '' }, 'unknown'],
  ['Googlebot', { userAgent: GOOGLEBOT }, 'unknown'],
];

describe('detectOs', () => {
  it.each(cases)('%s', (_label, input, expected) => {
    expect(detectOs(input)).toBe(expected);
  });
});

describe('osDisplayName', () => {
  it.each([
    ['windows11', 'Windows 11'],
    ['windows10', 'Windows 10'],
    ['windows', 'Windows'],
    ['macos', 'macOS'],
    ['iphone', 'iPhone'],
    ['ipad', 'iPad'],
    ['android', 'Android'],
    ['samsung', 'Samsung'],
    ['linux', 'Linux'],
    ['unknown', 'your device'],
  ] as const)('%s -> %s', (os, name) => {
    expect(osDisplayName(os)).toBe(name);
  });
});

describe('readDetectInput', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    Reflect.deleteProperty(navigator, 'userAgentData');
  });

  it('still resolves with userAgent when getHighEntropyValues rejects', async () => {
    Object.defineProperty(navigator, 'userAgentData', {
      configurable: true,
      value: {
        platform: 'Windows',
        getHighEntropyValues: vi.fn().mockRejectedValue(new Error('denied')),
      },
    });
    const input = await readDetectInput();
    expect(input.userAgent).toBe(navigator.userAgent);
    expect(input.platformVersion).toBeUndefined();
  });
});
