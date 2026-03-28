import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { startOfWeek } from "date-fns";
import { toZonedTime } from "date-fns-tz";

const WARSAW = "Europe/Warsaw";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Poniedziałek 00:00 w Europe/Warsaw jako Date (UTC wewnętrznie) */
export function startOfCalendarWeekWarsaw(now = new Date()): Date {
  const z = toZonedTime(now, WARSAW);
  return startOfWeek(z, { weekStartsOn: 1 });
}
