import { from, Observable, of, Subscription, timer } from "rxjs";
import { config } from "./config";
import { Config, SendMailFunction } from "./types";
import { catchError, map, switchMap, tap } from "rxjs/operators";
import {
  getCurrentDate,
  millisToHours,
  millisToMinutes,
  millisToSeconds
} from "./utils";
import { SentMessageInfo } from "nodemailer/lib/smtp-transport";

export class UpdateSender {
  private subscription: Subscription | undefined;

  constructor(
    private send: SendMailFunction,
    private updateProvider: Observable<string>
  ) {}

  start(repeater: Config["repeater"] = { type: "off" }) {
    let scheduledUpdate$: Observable<string | SentMessageInfo>;

    console.log("Starting update sender...");

    //TODO: Implement "diff" case when update are sent only when data changes
    switch (repeater.type) {
      case "off":
        console.log("Repeater option is OFF. Update will be sent only once.");
        scheduledUpdate$ = this.sendOnce();
        break;
      case "interval":
        let interval = repeater.milliseconds;
        console.log(
          `Repeater option set to INTERVAL. Update will be sent every: [${getLogOfReadableUnits(
            interval
          )}]`
        );
        scheduledUpdate$ = this.sendAtInterval(interval);
        break;
      default:
        console.warn(
          "Repeater option is invalid. Update will be sent only once."
        );
        scheduledUpdate$ = this.sendOnce();
        break;
    }

    this.subscription = scheduledUpdate$.subscribe(result =>
      console.log(result)
    );
  }

  stop() {
    if (!this.subscription) {
      console.warn("Stop request failed. Update sender must be started first.");
      return;
    }

    this.subscription.unsubscribe();
  }

  private sendOnce() {
    return this.updateProvider.pipe(
      map(text => ({
        to: config.recipient.email,
        subject: "CoronaVirus Update",
        text
      })),
      tap(mail => console.log(`Sending mail at [${getCurrentDate()}]: `, mail)),
      switchMap(mail =>
        from(this.send(mail)).pipe(
          map(({ full }) => full),
          catchError(error => of(`Failed to send email: ${error}`))
        )
      )
    );
  }

  private sendAtInterval(milliseconds: number) {
    return timer(0, milliseconds).pipe(switchMap(() => this.sendOnce()));
  }
}

/**
 * Converts provided milliseconds to other units of time (seconds, minutes, hours) and creates a
 * string that contains only the units which are easily readable.
 * @param milliseconds - number of milliseconds to convert
 * @param readableCutoff - value about this cutoff point will be considered unreadable
 */
function getLogOfReadableUnits(
  milliseconds: number,
  readableCutoff = 100
): string {
  return Object.entries({
    milliseconds,
    seconds: millisToSeconds(milliseconds),
    minutes: millisToMinutes(milliseconds),
    hours: millisToHours(milliseconds)
  })
    .filter(([unitOfTime, value]) => value > 0 && value < readableCutoff)
    .map(([unitOfTime, value]) => `${value} ${unitOfTime}`)
    .join(" = ");
}
