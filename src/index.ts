import { catchError, map, pluck, switchMap } from "rxjs/operators";
import { combineLatest, from, of } from "rxjs";
import axios from "axios";
import {
  Carrier,
  carrierAddressMap,
  Cases,
  Config,
  ConfigVar,
  CoronaData,
  isValidCarrier,
  SendMailFunction
} from "./types";

if (!process.env.GMAIL_USER) {
  throw new Error("Must provide gmail user account from which to send emails.");
}

if (!process.env.GMAIL_PASS) {
  throw new Error(
    "Must provide a password to authenticate with gmail. For instructions see: https://github.com/alykoshin/gmail-send#prerequisites"
  );
}

const parseIntoList = (value: string) => {
  return value.split(",");
};

const parseIntoStates = (listVar: ConfigVar) => {
  if (!listVar) {
    throw new Error(
      "Must provide valid comma-delimited list of states to look up. Example: STATES_LIST='West Virginia,Arizona'"
    );
  }
  return parseIntoList(listVar);
};

const parseIntoEmail = (
  phoneNumber: ConfigVar,
  carrier: Carrier | ConfigVar
) => {
  if (!phoneNumber) {
    throw new Error("Must provide valid mobile phone number.");
  }

  if (!isValidCarrier(carrier)) {
    throw new Error(
      `Must provide valid mobile carried. Supported carries: ${Object.keys(
        carrierAddressMap
      )}`
    );
  }

  return `${phoneNumber}@${carrierAddressMap[carrier]}`;
};

const config: Config = {
  credentials: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  },
  recipient: {
    email: parseIntoEmail(process.env.PHONE_NUMBER, process.env.CARRIER)
  },
  search: {
    states: parseIntoStates(process.env.STATES_LIST)
  }
};

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
