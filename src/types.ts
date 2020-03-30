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
type RepeaterInterval = {
  type: "interval";
  milliseconds: number;
};
export type Config = {
  credentials: {
    user: string;
    pass: string;
  };
  recipients: {
    emails: string[];
  };
  find: {
    location: string;
  };
  repeater:
    | {
        type: "off" | "diff";
      }
    | RepeaterInterval;
};

export interface DataHandler<Input, Output> {
  (data: Input):Output
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export type Stats = {
  confirmed: number | string;
  deaths: number | string;
  recovered: number | string;
};

export interface SmsReady {
  location: {
    type: "country" | "province"
    name: string;
    coordinates: Coordinates;
    statistics: Stats;
    lastUpdated: string | Date;
  };
}

export interface Location {
  country:     string;
  province:    null | string;
  updatedAt:   Date;
  stats:       Stats;
  coordinates: Coordinates;
}
export type TrackerData = {
  /**
   * Johns Hopkins CSSE Data Repository
   */
  jhucsse: Location[]
};
