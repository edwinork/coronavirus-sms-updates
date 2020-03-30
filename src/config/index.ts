import { Carrier, carrierAddressMap, Config, ConfigVar } from "../types";
import { hoursToMillis } from "../common/utils";

const dotenv = require("dotenv");

// By default, send 1 update SMS every hour
const DEFAULT_UPDATE_INTERVAL = 1;

function getCredentials() {
  if (!process.env.GMAIL_USER) {
    throw new Error(
      "Must provide gmail user account from which to send emails."
    );
  }

  if (!process.env.GMAIL_PASS) {
    throw new Error(
      "Must provide a password to authenticate with gmail. For instructions see: https://github.com/alykoshin/gmail-send#prerequisites"
    );
  }

  return {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  };
}

function parseIntoList(value: string) {
  return value.split(",");
}

function parseIntoLocation(locationVar: ConfigVar) {
  if (!locationVar) {
    throw new Error(
      "Must provide valid location to look up. Example: FIND_LOCATION='Arizona'"
    );
  }
  return locationVar;
}

function parseIntoRecipients(recipientsListVar: ConfigVar) {
  if (!recipientsListVar) {
    throw new Error(
      "Must provide valid comma-delimited list of recipients. Example: RECIPIENTS='7773331111@t-mobile,7778884444@verizon'"
    );
  }

  const recipientRegex = /(.*)@(.*)/;

  const convertRecipient = (recipient: string) =>
    recipient.replace(
      recipientRegex,
      (match, group1, group2) =>
        `${group1}@${carrierAddressMap[group2 as Carrier]}`
    );

  return {
    emails: parseIntoList(recipientsListVar).map(convertRecipient)
  };
}

function parseIntoRepeaterOptions(
  updateIntervalInHours: ConfigVar
): Config["repeater"] {
  if (!updateIntervalInHours) {
    console.log(
      `User did not configure UPDATE INTERVAL. By default, update notification will be sent only once.`
    );
    return {
      type: "off"
    };
  }
  const interval = Number(updateIntervalInHours);

  if (isNaN(interval) || !Number.isInteger(interval) || interval <= 0) {
    console.log(
      `User did not provide valid update interval. Using default value of one update per every ${DEFAULT_UPDATE_INTERVAL} hours.`
    );
    return {
      type: "interval",
      milliseconds: hoursToMillis(DEFAULT_UPDATE_INTERVAL)
    };
  }

  return {
    type: "interval",
    milliseconds: hoursToMillis(interval)
  };
}

// TODO: Allow user to pass PHONE_NUMBER, CARRIER, and STATES_LIST as command line args or inside a config file.
function createConfig(): Config {
  dotenv.config();
  return {
    credentials: getCredentials(),
    recipients: parseIntoRecipients(process.env.RECIPIENTS_LIST),
    find: {
      location: parseIntoLocation(process.env.FIND_LOCATION)
    },
    repeater: parseIntoRepeaterOptions(process.env.UPDATE_INTERVAL_IN_HOURS)
  };
}

export const config = createConfig();
