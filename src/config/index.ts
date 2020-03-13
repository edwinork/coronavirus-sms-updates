import {
  Carrier,
  carrierAddressMap,
  Config,
  ConfigVar,
  isValidCarrier
} from "../types";

const dotenv = require("dotenv");

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

function parseIntoStates(listVar: ConfigVar) {
  if (!listVar) {
    throw new Error(
      "Must provide valid comma-delimited list of states to look up. Example: STATES_LIST='West Virginia,Arizona'"
    );
  }
  return parseIntoList(listVar);
}

function parseIntoEmail(phoneNumber: ConfigVar, carrier: Carrier | ConfigVar) {
  if (!phoneNumber) {
    throw new Error("Must provide valid mobile phone number.");
  }

  if (!isValidCarrier(carrier)) {
    throw new Error(
      `Must provide valid mobile carried. Supported carries: ${Object.keys(
        carrierAddressMap
      )}`
    );
  }

  return `${phoneNumber}@${carrierAddressMap[carrier]}`;
}

// TODO: Allow user to pass PHONE_NUMBER, CARRIER, and STATES_LIST as command line args or inside a config file.
function createConfig():Config {
  dotenv.config();
  return {
    credentials: getCredentials(),
    recipient: {
      email: parseIntoEmail(process.env.PHONE_NUMBER, process.env.CARRIER)
    },
    search: {
      states: parseIntoStates(process.env.STATES_LIST)
    }
  };
}

export const config = createConfig();
