import { config } from "./config";
import { SmsSender } from "./sms/sms-sender";
import { SendMailFunction } from "./types";
import { DataProvider } from "./corona-tracker/data-provider";
import { getDataHandler } from "./corona-tracker/data-handler";

const signale = require("signale");
require("pretty-error").start();

function main() {
  const { user, pass } = config.credentials;
  const sender = require("gmail-send")({
    user,
    pass,
    to: config.recipients.emails
  }) as SendMailFunction;

  const send = new SmsSender(sender).start();
  const data = new DataProvider(getDataHandler(config));
}

main();
