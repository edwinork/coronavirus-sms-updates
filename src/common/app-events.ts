import { Emitter } from "@servie/events";

interface AppEvents {
  APP_EXIT_INITIATED: [];
}

export const AppEvents = new Emitter<AppEvents>();
