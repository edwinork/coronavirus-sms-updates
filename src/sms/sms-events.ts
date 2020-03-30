import { Emitter } from "@servie/events";
import { MailOptions } from "nodemailer/lib/sendmail-transport";
import { Attachment } from "nodemailer/lib/mailer";

interface Events {
  SMS_TXT_CREATED: [string];
  SMS_ATTACHMENTS_CREATED: [Attachment[]];
  SMS_NOTIFICATION_STAGED: [MailOptions];
  SMS_SEND_REQUEST: []
}

export const SmsEvents = new Emitter<Events>();
