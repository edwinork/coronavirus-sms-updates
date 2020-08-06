import { config } from "./config";
import { SmsSender } from "./sms/sms-sender";
import { SendMailFunction } from "./types";
import { DataProvider } from "./corona-tracker/data-provider";
import { getDataHandler } from "./corona-tracker/data-handler";
import { AppEvents } from "./common/app-events";
import { logger } from "./common/logger";
require("pretty-error").start();

function main() {
  const onExit = () => {
    logger.pending("Initiating app exit...");
    AppEvents.emit("APP_EXIT_INITIATED");
  };
  const onCtrlC = () => {
    logger.info("CTRL-C...");
    return process.exit(2);
  };

  process.once("exit", onExit).once("SIGINT", onCtrlC);

  const { user, pass } = config.credentials;
  const sender = require("gmail-send")({
    user,
    pass,
    to: config.recipients.emails
  }) as SendMailFunction;

  const send = new SmsSender(sender).start({
    type: "interval",
    milliseconds: 60000
  });
  const data = new DataProvider(getDataHandler(config));
}

main();
