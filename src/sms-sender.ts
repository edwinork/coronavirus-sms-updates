import { combineLatest, from, of } from "rxjs";
import { config } from "./config";
import {
  Cases,
  CoronaData,
  Latest,
  LatestPerLocation,
  SendMailFunction
} from "./types";
import { catchError, map, switchMap } from "rxjs/operators";
import { getCoronaData } from "./coronavirus-tracker";

export function createSmsSender(user: string, pass: string) {
  const send = require("gmail-send")({
    user,
    pass
  }) as SendMailFunction;

  const records$ = getCoronaData();

  return combineLatest([of(config.search.states), records$]).pipe(
    map(countCasesPerLocation),
    map(createMessageFromLocationRecords),
    switchMap(text =>
      from(
        send({
          to: config.recipient.email,
          subject: "CoronaVirus Update",
          text
        })
      ).pipe(
        map(({ full }) => full),
        catchError(error => of(`Failed to send email: ${error}`))
      )
    )
  );
}

function countCasesPerLocation([states, records]: [string[], CoronaData]) {
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


