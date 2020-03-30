import { SmsReady } from "../types";
import { toReadableDate } from "../common/utils";

export async function createSmsText({ location }: SmsReady) {
  const {
    name,
    lastUpdated,
    statistics: { confirmed, deaths, recovered }
  } = location;

  return `Last Updated: ${toReadableDate(lastUpdated)}
  ${name.toUpperCase()}
    Confirmed: ${confirmed}
    Deaths: ${deaths}
    Recovered: ${recovered}
  `;
}
