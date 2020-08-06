import { from, Observable, of, Subscription, timer } from "rxjs";
import { Config, SendMailFunction } from "../types";
import {
  catchError,
  switchMap,
  switchMapTo,
  take,
  takeLast,
  timeout
} from "rxjs/operators";
import { getCurrentDate, minutesToMillis, prettyMillis } from "../common/utils";
import { SmsProvider } from "./sms-provider";
import {
  MailOptions,
  SentMessageInfo
} from "nodemailer/lib/sendmail-transport";
import { logger } from "../common/logger";
import { AppEvents } from "../common/app-events";
import { once } from "@servie/events";

type SentStatus = {
  result: SentMessageInfo["response"];
  full: SentMessageInfo;
};

export class SmsSender {
  private subscription: Subscription;

  constructor(
    private sender: SendMailFunction,
    private smsProvider = new SmsProvider()
  ) {
    once(AppEvents, "APP_EXIT_INITIATED", () => this.stop());
  }

  async send(sms: MailOptions) {
    logger.pending(`Sending sms at [${getCurrentDate()}]: `, sms);
    return this.sender(sms);
  }

  start(repeater: Config["repeater"] = { type: "off" }) {
    const sender$ = this.fromLatestSms();
    logger.start("Starting update sender...");

    //TODO: Implement "diff" case when update sent only when data changes
    switch (repeater.type) {
      case "off":
        logger.info("Repeater option is OFF. Update will be sent only once.");
        this.subscription = this.initSubscription(sender$);
        break;
      case "interval":
        let interval = repeater.milliseconds;
        logger.info(
          `Repeater option set to INTERVAL. Update will be sent every: [${prettyMillis(
            interval
          )}]`
        );
        this.subscription = this.initSubscription(
          SmsSender.sendAtInterval(interval, sender$)
        );
        break;
      default:
        logger.warn(
          "Repeater option is invalid. Update will be sent only once."
        );
        this.subscription = this.initSubscription(sender$);
        break;
    }
  }

  stop() {
    if (!this.subscription) {
      logger.warn(
        "Skipping SMS provider stop request. Update sender must be started first."
      );
      return;
    }
    this.subscription.unsubscribe();
    logger.complete("SMS sender stopped.");
  }

  private fromLatestSms() {
    return this.smsProvider.fromSms().pipe(
      takeLast(1),
      switchMap(sms => from(this.send(sms)))
    );
  }

  private initSubscription(sender$: Observable<SentStatus>) {
    const onNew = ({ full, result }: SentStatus) => {
      logger.success("Sms sent: ", result);
      logger.debug("Details: ", full);
    };
    const onError = (error: unknown) =>
      logger.error(`Failed to send a scheduled SMS. Reason: `, error);
    const onComplete = () => {
      logger.complete("All scheduled SMS have been sent. Exiting...");
      AppEvents.emit("APP_EXIT_INITIATED");
    };

    return sender$.subscribe(onNew, onError, onComplete);
  }

  private static sendAtInterval(
    milliseconds: number,
    sender$: Observable<SentStatus>,
    timeoutInterval = minutesToMillis(3)
  ) {
    return timer(0, milliseconds).pipe(
      switchMapTo(
        sender$.pipe(
          timeout(timeoutInterval),
          catchError(error => {
            logger.error("SMS provider timed out. Exiting application...");
            AppEvents.emit("APP_EXIT_INITIATED");
            return of(error);
          })
        )
      )
    );
  }
}
