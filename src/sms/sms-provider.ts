import { BehaviorSubject } from "rxjs";
import { DataEvents } from "../corona-tracker/data-events";
import { MailOptions } from "nodemailer/lib/sendmail-transport";
import { SmsReady } from "../types";
import { createSmsText } from "./sms-text";
import { SmsAttachments } from "./sms-attachments";
import { logger } from "../common/logger";
import { AppEvents } from "../common/app-events";
import { once } from "@servie/events";
import { skipWhile } from "rxjs/operators";

export class SmsProvider {
  private smsSubject = new BehaviorSubject<MailOptions>(null);
  private sms$ = this.smsSubject.asObservable();

  constructor(private attachmentsProvider = new SmsAttachments()) {
    const onNewData = (data: SmsReady) => this.build(data);
    DataEvents.on("NEW_DATA_AVAILABLE", onNewData);
    once(AppEvents, "APP_EXIT_INITIATED", () => {
      DataEvents.off("NEW_DATA_AVAILABLE", onNewData);
      logger.complete("SMS provider stopped.");
    });
  }

  fromSms = () => {
    return this.sms$.pipe(skipWhile(sms => sms === null));
  };

  getSms = () => {
    this.smsSubject.getValue();
  };

  async build(data: SmsReady) {
    const [text, attachments] = await Promise.all([
      createSmsText(data),
      this.attachmentsProvider.preload(data)
    ]);
    logger.debug("Provider finished building new SMS...");
    this.smsSubject.next({
      subject: "CoronaVirus Update",
      text,
      attachments
    });
  }
}
