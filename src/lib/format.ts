const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatPoint(value: string): string {
  const [year, month] = value.split('-');
  return month ? `${MONTHS[Number(month) - 1]} ${year}` : (year ?? value);
}

export function formatDateRange(start: string | undefined, end: string | 'present'): string {
  const to = end === 'present' ? 'Present' : formatPoint(end);
  return start ? `${formatPoint(start)} – ${to}` : to;
}

function toMonthIndex(value: string): number {
  const [year, month] = value.split('-').map(Number);
  return (year ?? 0) * 12 + ((month ?? 1) - 1);
}

/** Inclusive of both the start and end month. */
export function formatDuration(start: string, end: string | 'present', now: Date = new Date()): string {
  const endIndex = end === 'present' ? now.getFullYear() * 12 + now.getMonth() : toMonthIndex(end);
  const total = Math.max(endIndex - toMonthIndex(start) + 1, 1);
  const years = Math.floor(total / 12);
  const months = total % 12;
  const parts: string[] = [];
  if (years) parts.push(`${years} ${years === 1 ? 'yr' : 'yrs'}`);
  if (months) parts.push(`${months} ${months === 1 ? 'mo' : 'mos'}`);
  return parts.join(' ');
}

/** 'YYYY-MM-DD' -> 'Oct 15, 2026' (no timezone shifts). */
export function formatPostDate(value: string): string {
  const [year, month, day] = value.split('-');
  return `${MONTHS[Number(month) - 1]} ${Number(day)}, ${year}`;
}

/** Whole minutes at 200 words per minute, at least 1. */
export function readingTime(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}
