import { SendMailOptions } from "nodemailer";
import { SentMessageInfo } from "nodemailer/lib/sendmail-transport";

export const carrierAddressMap = {
  "t-mobile": "tmomail.net",
  verizon: "vtext.com",
  att: "txt.att.net",
  sprint: "messaging.sprintpcs.com",
  "virgin-mobile": "vmobl.com",
  "us-cellular": "mms.uscc.net",
  nextel: "mms.uscc.net",
  alltel: "message.alltel.com"
} as const;

export type Carrier = keyof typeof carrierAddressMap;

export function isValidCarrier(name: ConfigVar): name is Carrier {
  return name !== undefined && Object.keys(carrierAddressMap).includes(name);
}

export type SendMailFunction = (
  mail: SendMailOptions
) => Promise<{ result: SentMessageInfo["response"]; full: SentMessageInfo }>;

export type ConfigVar = string | undefined;
export type Config = {
  credentials: {
    user: string;
    pass: string;
  };
  recipient: {
    email: string;
  };
  search: {
    states: string[];
  };
};

interface Coordinates {
  lat: string;
  long: string;
}

interface Location {
  coordinates: Coordinates;
  country: string;
  country_code: string;
  history: { [key: string]: string };
  latest: number;
  province: string;
}

export interface Cases {
  last_updated: Date;
  latest: number;
  locations: Location[];
  source: string;
}

interface Latest {
  confirmed: number;
  deaths: number;
  recovered: number;
}

export interface CoronaData {
  confirmed: Cases;
  deaths: Cases;
  latest: Latest;
  recovered: Cases;
}
