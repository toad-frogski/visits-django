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
