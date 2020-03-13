import { from, of } from "rxjs";
import axios from "axios";
import { CoronaData } from "./types";
import { catchError, pluck, switchMap } from "rxjs/operators";

export function getCoronaData() {
  return from(
    axios.get<CoronaData>("https://coronavirus-tracker-api.herokuapp.com/all")
  ).pipe(
    pluck("data"),
    switchMap(records => of(records)),
    catchError(error => {
      console.log("Failed to retrieve Coronavirus data.", error);
      return of(error);
    })
  );
}
