import { CalendarDate, type DateValue } from "@internationalized/date";

export type Time = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

export const parseMs = (
  ms: number,
  options: {
    roundHours?: boolean;
    roundMinutes?: boolean;
    roundSeconds?: boolean;
  } = {}
): Time => {
  const { roundHours = true, roundMinutes = true, roundSeconds = true } = options;

  let days = Math.floor(ms / (24 * 60 * 60 * 1000));
  let hours = Math.floor(ms / (60 * 60 * 1000));
  let minutes = Math.floor(ms / (60 * 1000));
  let seconds = Math.floor(ms / 1000);

  if (roundHours) hours %= 24;
  if (roundMinutes) minutes %= 60;
  if (roundSeconds) seconds %= 60;

  return { days, hours, minutes, seconds };
};

export const formatTime = (value: Time): string => {
  if (value.hours !== 0 || value.minutes !== 0) {
    return `${String(value.hours).padStart(2, "0")}:${String(value.minutes).padStart(2, "0")}`;
  }

  return "--:--";
};

export const formatDate = (date: DateValue) => {
  return `${date.year}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`;
};

export const parseDate = (dateStr: string | null): CalendarDate | null => {
  if (!dateStr) return null;

  const [yearStr, monthStr, dayStr] = dateStr.split("-");

  return new CalendarDate(Number(yearStr), Number(monthStr), Number(dayStr));
};
