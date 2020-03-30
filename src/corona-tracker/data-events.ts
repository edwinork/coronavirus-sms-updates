import { Location, SmsReady, TrackerData } from "../types";
import { Emitter } from "@servie/events";

interface Events {
  NEW_DATA_AVAILABLE: [SmsReady];
}

export const DataEvents = new Emitter<Events>();
