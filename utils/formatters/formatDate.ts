import { ko } from 'date-fns/locale';
import { formatInTimeZone } from 'date-fns-tz';

export type Timezone = 'Asia/Seoul' | 'UTC' | string;

interface FormatDateOptions {
  timezone?: Timezone;
}

const DEFAULT_TIMEZONE: Timezone = 'Asia/Seoul';

export function formatDate(
  date: Date,
  format: string,
  option?: FormatDateOptions,
): string {
  const timezone = option?.timezone ?? DEFAULT_TIMEZONE;

  return formatInTimeZone(date, timezone, format, {
    locale: ko,
  });
}
