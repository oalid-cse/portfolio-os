export type DetectedOs =
  | 'windows11'
  | 'windows10'
  | 'windows'
  | 'macos'
  | 'iphone'
  | 'ipad'
  | 'android'
  | 'samsung'
  | 'linux'
  | 'unknown';

export type DetectInput = {
  userAgent: string;
  /** navigator.userAgentData?.platform */
  platform?: string;
  /** From getHighEntropyValues(['platformVersion']). */
  platformVersion?: string;
  maxTouchPoints?: number;
};

const BOT = /bot|crawler|spider/i;

function windowsFamily(platformVersion: string | undefined): DetectedOs {
  const major = Number.parseInt(platformVersion ?? '', 10);
  if (Number.isNaN(major) || major < 1) return 'windows';
  return major >= 13 ? 'windows11' : 'windows10';
}

export function detectOs(input: DetectInput): DetectedOs {
  const ua = input.userAgent;
  if (!ua || BOT.test(ua)) return 'unknown';

  if (ua.includes('iPhone')) return 'iphone';
  const isMac = ua.includes('Macintosh');
  if (ua.includes('iPad') || (isMac && (input.maxTouchPoints ?? 0) > 1)) return 'ipad';
  if (ua.includes('SamsungBrowser') || /\bSM-/.test(ua)) return 'samsung';
  if (ua.includes('Android')) return 'android';
  if (isMac) return 'macos';
  if (ua.includes('Windows')) return windowsFamily(input.platformVersion);
  if (ua.includes('Linux')) return 'linux';
  return 'unknown';
}

type UserAgentDataLike = {
  platform?: string;
  getHighEntropyValues?: (hints: string[]) => Promise<{ platformVersion?: string }>;
};

/** Browser-only. Never rejects. */
export async function readDetectInput(): Promise<DetectInput> {
  const input: DetectInput = {
    userAgent: navigator.userAgent,
    maxTouchPoints: navigator.maxTouchPoints,
  };
  const uaData = (navigator as Navigator & { userAgentData?: UserAgentDataLike }).userAgentData;
  if (uaData) {
    input.platform = uaData.platform;
    try {
      const values = await uaData.getHighEntropyValues?.(['platformVersion']);
      if (values?.platformVersion) input.platformVersion = values.platformVersion;
    } catch {
      // High-entropy hints are optional; fall back to the UA string alone.
    }
  }
  return input;
}

const NAMES: Record<DetectedOs, string> = {
  windows11: 'Windows 11',
  windows10: 'Windows 10',
  windows: 'Windows',
  macos: 'macOS',
  iphone: 'iPhone',
  ipad: 'iPad',
  android: 'Android',
  samsung: 'Samsung',
  linux: 'Linux',
  unknown: 'your device',
};

export function osDisplayName(os: DetectedOs): string {
  return NAMES[os];
}
