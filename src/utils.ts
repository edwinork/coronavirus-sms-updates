import dayjs from "dayjs";

export function millisToSeconds(milliseconds: number) {
  return Math.floor(milliseconds / 1000);
}

export function millisToMinutes(milliseconds: number) {
  return Math.floor(millisToSeconds(milliseconds) / 60);
}

export function millisToHours(milliseconds: number) {
  return Math.floor(millisToMinutes(milliseconds) / 60);
}

export function hoursToMillis(hours: number) {
  return Math.floor(hours * 3600000);
}

export function getCurrentDate() {
  return dayjs().format("MMM D, YYYY h:mm A");
}

export function toReadableDate(date:string | Date) {
  return dayjs(date).format("MMM D, YYYY h:mm A");
}
