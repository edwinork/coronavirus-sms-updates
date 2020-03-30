import dayjs from "dayjs";
import prettyMilliseconds from "pretty-ms";

export function hoursToMillis(hours: number) {
  return Math.floor(hours * 3600000);
}

export function prettyMillis(milliseconds: number) {
  return prettyMilliseconds(milliseconds, { verbose: true });
}

export function getCurrentDate() {
  return dayjs().format("MMM D, YYYY h:mm A");
}

export function toReadableDate(date: string | Date) {
  return dayjs(date).format("MMM D, YYYY h:mm A");
}
