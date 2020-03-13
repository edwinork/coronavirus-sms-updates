import { config } from "./config";
import { createSmsSender } from "./sms-sender";

function main() {
  const { user, pass } = config.credentials;
  const smsSender$ = createSmsSender(user, pass);

  smsSender$.subscribe(response => {
    console.log(response);
  });
}

main();
