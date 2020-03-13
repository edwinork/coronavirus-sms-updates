import { catchError, map, pluck, switchMap } from "rxjs/operators";
import { combineLatest, from, of } from "rxjs";
import axios from "axios";
import { Cases, CoronaData, SendMailFunction } from "./types";
import {config} from "./config";

const send = require("gmail-send")({
  user: config.credentials.user,
  pass: config.credentials.pass
}) as SendMailFunction;

const records$ = from(
  axios.get<CoronaData>("https://coronavirus-tracker-api.herokuapp.com/all")
).pipe(
  pluck("data"),
  switchMap(({ latest, confirmed, deaths, recovered }) =>
    of({ latest, confirmed, deaths, recovered })
  ),
  catchError(error => {
    console.log("Failed to retrieve Coronavirus data.", error);
    return of(error);
  })
);

const lookUp = (state: string, { locations }: Cases) =>
  locations.find(location => location.province === state)?.latest ?? "no data";

const createMessage = (
  name: string,
  { confirmed, deaths, recovered }: Record<string, number | string>
) =>
  `
  ${name.toUpperCase()}
    confirmed: ${confirmed}
    deaths: ${deaths}
    recovered: ${recovered}
  `;

const state$ = combineLatest([of(config.search.states), records$])
  .pipe(
    map(
      ([states, { latest, confirmed, deaths, recovered }]: [
        string[],
        CoronaData
      ]) => {
        const worldUpdate = createMessage("WORLD", {
          ...latest
        });
        const stateUpdates = states
          .map(state =>
            createMessage(state, {
              confirmed: lookUp(state, confirmed),
              deaths: lookUp(state, deaths),
              recovered: lookUp(state, recovered)
            })
          )
          .join("");
        return worldUpdate + stateUpdates;
      }
    ),
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
  )
  .subscribe(response => {
    console.log(response);
  });
