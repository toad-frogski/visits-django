export type Time = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

export const parseMs = (ms: number): Time => {
  return {
    days: Math.floor(ms / (60 * 60 * 1000) / 24),
    hours: Math.floor(ms / (60 * 60 * 1000)) % 24,
    minutes: Math.floor(ms / (60 * 1000)) % 60,
    seconds: Math.floor(ms / 1000) % 60,
  };
};

export const formatTime = (value: Time): string => {
  if (value.hours !== 0 || value.minutes !== 0) {
    return `${String(value.hours).padStart(2, "0")}:${String(value.minutes).padStart(2, "0")}`;
  }

  return "--:--";
};
