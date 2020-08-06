import { DataHandler, Location, SmsReady } from "../types";
import { DataEvents } from "./data-events";
import { getJohnsHopkinsCsseData } from "./tracker-api";
import { logger } from "../common/logger";
import { prettyMillis } from "../common/utils";
import { from, Subscription, timer } from "rxjs";
import { switchMapTo } from "rxjs/operators";
import { AppEvents } from "../common/app-events";
import { once } from "@servie/events";

const DEFAULT_REFRESH_INTERVAL = 30000;

type Fetched = Location[];
type Transformed = SmsReady;

export class DataProvider {
  private cache: {
    fetched?: Fetched;
    transformed?: Transformed;
  };
  private subscription: Subscription;

  constructor(
    private dataHandler: DataHandler<Fetched, Transformed>,
    private refreshInterval = DEFAULT_REFRESH_INTERVAL
  ) {
    once(AppEvents, "APP_EXIT_INITIATED", () => this.stop());
    this.initRefresher(refreshInterval);
  }

  /**
   * Fetches and caches corona tracker data.
   */
  async fetch(): Promise<Fetched> {
    try {
      return await this.getLocations();
    } catch (error) {
      logger.error("Failed to fetch data from Corona Tracker.");
      throw error;
    }
  }

  async getLocations(): Promise<Location[]> {
    return await getJohnsHopkinsCsseData();
  }

  stop() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    logger.complete("Data provider stopped.");
  }

  private initRefresher(interval: number) {
    if (interval < DEFAULT_REFRESH_INTERVAL) {
      throw new Error(
        `Interval at which provider fetches new data, cannot be less than ${prettyMillis(
          DEFAULT_REFRESH_INTERVAL
        )} (${DEFAULT_REFRESH_INTERVAL} milliseconds.`
      );
    }
    this.subscription = timer(0, interval)
      .pipe(switchMapTo(from(this.pullNewData())))
      .subscribe(
        transformed => {
          logger.debug("Pulled new data and refreshed cache.");
          DataEvents.emit("NEW_DATA_AVAILABLE", transformed);
        },
        error => logger.error("Failed to pull new data. Reason: ", error)
      );
  }

  private async pullNewData() {
    const fetched = await this.fetch();
    const transformed = this.dataHandler(fetched);
    this.cache = {
      ...this.cache,
      fetched,
      transformed
    };
    return transformed;
  }
}
