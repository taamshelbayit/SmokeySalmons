import parser from 'cron-parser';
import { formatInTimeZone } from 'date-fns-tz';
import { ORDER_CUTOFF_CRON, TIMEZONE } from './config';

export async function getCutoffInfo() {
  const now = new Date();
  const interval = parser.parseExpression(ORDER_CUTOFF_CRON, { tz: TIMEZONE });
  let next = interval.next().toDate();
  // If we're past cutoff but before Friday, orders for next Friday.
  const label = `Thursday 10:00`;
  // We mark open if now is before this week's Thursday 10:00; else next week's.
  const isOpen = now < next;
  return {
    label,
    iso: formatInTimeZone(next, TIMEZONE, "yyyy-MM-dd'T'HH:mm:ssXXX"),
    isOpen,
  };
}
