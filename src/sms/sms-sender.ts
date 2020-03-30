import { Subscription, timer } from "rxjs";
import { Config, SendMailFunction } from "../types";
import { switchMapTo } from "rxjs/operators";
import { getCurrentDate, prettyMillis } from "../common/utils";
import { SmsProvider } from "./sms-provider";
import { MailOptions } from "nodemailer/lib/sendmail-transport";

export class SmsSender {
  private subscription: Subscription | undefined;

  constructor(
    private sender: SendMailFunction,
    private smsProvider = new SmsProvider()
  ) {}

  send(sms: MailOptions) {
    console.log(`Sending sms at [${getCurrentDate()}]: `, sms);
    this.sender(sms)
      .then(({ full }) => console.log("SUCCESS: ", full))
      .catch(error => console.log("Failed to send sms. REASON: ", error));
  }

  start(repeater: Config["repeater"] = { type: "interval",milliseconds: 30000 }) {
    const send = (sms: MailOptions) => this.send(sms);
    console.log("Starting update sender...");

    //TODO: Implement "diff" case when update are sent only when data changes
    switch (repeater.type) {
      case "off":
        console.log("Repeater option is OFF. Update will be sent only once.");
        this.smsProvider.fromSms().subscribe(send);
        break;
      case "interval":
        let interval = repeater.milliseconds;
        console.log(
          `Repeater option set to INTERVAL. Update will be sent every: [${prettyMillis(
            interval
          )}]`
        );
        this.sendAtInterval(interval, this.smsProvider.fromSms).subscribe(send);
        break;
      default:
        console.warn(
          "Repeater option is invalid. Update will be sent only once."
        );
        this.smsProvider.fromSms().subscribe(send);
        break;
    }
  }

  stop() {
    if (!this.subscription) {
      console.warn("Stop request failed. Update sender must be started first.");
      return;
    }

    this.subscription.unsubscribe();
  }

  private sendAtInterval(
    milliseconds: number,
    fromSms: SmsProvider["fromSms"]
  ) {
    return timer(0, milliseconds).pipe(switchMapTo(fromSms()));
  }
}
