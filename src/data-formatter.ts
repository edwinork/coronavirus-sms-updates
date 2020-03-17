import { OperatorFunction, pipe } from "rxjs";
import { map } from "rxjs/operators";
import {
  Cases,
  Config,
  CoronaData,
  Latest,
  LatestPerLocation,
  NotificationData
} from "./types";
import { toReadableDate } from "./utils";

function countCasesPerLocation(
  records: CoronaData,
  states: string[]
): NotificationData {
  // API provides case counts for the whole world in "latest" field.
  const world = records.latest;

  const { confirmed, deaths, recovered } = records;
  const lastUpdated = confirmed.last_updated;

  const reducer = (locationToCasesMap: LatestPerLocation, location: string) => {
    return {
      ...locationToCasesMap,
      [location]: {
        confirmed: lookUp(location, confirmed),
        deaths: lookUp(location, deaths),
        recovered: lookUp(location, recovered)
      }
    };
  };
  return {
    ...states.reduce(reducer, { world }),
    lastUpdated
  } as NotificationData;
}

function lookUp(state: string, { locations }: Cases) {
  return (
    locations.find(location => location.province === state)?.latest ?? "no data"
  );
}

function createMessageFromLocationRecords(notificationData: NotificationData) {
  const { lastUpdated, ...records } = notificationData;
  const lastUpdatedMessage = `Cases as of (${toReadableDate(lastUpdated)})`;
  const recordsMessage = Object.entries(records)
    .map(([location, latest]) => createMessage(location, latest))
    .join("");
  return lastUpdatedMessage + "\n" + recordsMessage;
}

function createMessage(name: string, { confirmed, deaths, recovered }: Latest) {
  return `
  ${name.toUpperCase()}
    confirmed: ${confirmed}
    deaths: ${deaths}
    recovered: ${recovered}
  `;
}

export function formatCoronaData(
  search: Config["search"]
): OperatorFunction<CoronaData, string> {
  return pipe(
    map(data => countCasesPerLocation(data, search.states)),
    map(createMessageFromLocationRecords)
  );
}
