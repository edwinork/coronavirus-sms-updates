import { config } from "./config";
import { UpdateSender } from "./update-sender";
import { SendMailFunction } from "./types";
import { getCoronaData } from "./coronavirus-tracker";
import { formatCoronaData } from "./data-formatter";

function main() {
  const { user, pass } = config.credentials;
  const send = require("gmail-send")({
    user,
    pass
  }) as SendMailFunction;

  const formattedData$ = getCoronaData().pipe(formatCoronaData(config.search));

  const updateSender = new UpdateSender(send, formattedData$);
  updateSender.start(config.repeater);
}

main();
