import { Subject } from "rxjs";
import { DataEvents } from "../corona-tracker/data-events";
import { MailOptions } from "nodemailer/lib/sendmail-transport";
import { SmsReady } from "../types";
import { createSmsText } from "./sms-text";
import { SmsAttachments } from "./sms-attachments";

export class SmsProvider {
  private smsSubject = new Subject<MailOptions>();
  private sms$ = this.smsSubject.asObservable();

  constructor(private attachmentsProvider = new SmsAttachments()) {
    DataEvents.on("NEW_DATA_AVAILABLE", data => this.build(data));
  }

  fromSms = () => this.sms$;

  async build(data: SmsReady) {
    const [text, attachments] = await Promise.all([
      createSmsText(data),
      this.attachmentsProvider.preload(data)
    ]);
    this.smsSubject.next({
      subject: "CoronaVirus Update",
      text,
      attachments
    });
  }
}
