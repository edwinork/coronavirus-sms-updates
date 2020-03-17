import { OperatorFunction, pipe } from "rxjs";
import { map } from "rxjs/operators";
import { Cases, Config, CoronaData, Latest, LatestPerLocation } from "./types";

function countCasesPerLocation(records: CoronaData, states: string[]) {
  // API provides case counts for the whole world in "latest" field.
  const world = records.latest;

  const { confirmed, deaths, recovered } = records;

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
  return states.reduce(reducer, { world });
}

function lookUp(state: string, { locations }: Cases) {
  return (
    locations.find(location => location.province === state)?.latest ?? "no data"
  );
}

function createMessageFromLocationRecords(records: LatestPerLocation) {
  return Object.entries(records)
    .map(([location, latest]) => createMessage(location, latest))
    .join("");
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
