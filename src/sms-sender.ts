import { combineLatest, from, of } from "rxjs";
import { config } from "./config";
import {
  Cases,
  CoronaData,
  Latest,
  LatestPerLocation,
  SendMailFunction
} from "./types";
import axios from "axios";
import { catchError, map, pluck, switchMap } from "rxjs/operators";

export function createSmsSender(user: string, pass: string) {
  const send = require("gmail-send")({
    user,
    pass
  }) as SendMailFunction;

  const records$ = from(
    axios.get<CoronaData>("https://coronavirus-tracker-api.herokuapp.com/all")
  ).pipe(
    pluck("data"),
    switchMap(records => of(records)),
    catchError(error => {
      console.log("Failed to retrieve Coronavirus data.", error);
      return of(error);
    })
  );

  return combineLatest([of(config.search.states), records$])
    .pipe(
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

function lookUp(state: string, {locations}: Cases) {
  return locations.find(location => location.province === state)?.latest ??
      "no data";
}

function createMessage(
    name: string,
    {confirmed, deaths, recovered}: Latest
) {
  return `
  ${name.toUpperCase()}
    confirmed: ${confirmed}
    deaths: ${deaths}
    recovered: ${recovered}
  `;
}

function createMessageFromLocationRecords(records: LatestPerLocation) {
  return Object.entries(records)
      .map(([location, latest]) => createMessage(location, latest))
      .join("");
}

function countCasesPerLocation([states, records]: [string[], CoronaData]) {
  // API provides case counts for the whole world in "latest" field.
  const world = records.latest;

  const { confirmed, deaths, recovered } = records;

  const reducer = (
      locationToCasesMap: LatestPerLocation,
      location: string
  ) => {
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
