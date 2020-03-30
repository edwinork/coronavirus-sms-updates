import { DataHandler, Location, SmsReady } from "../types";
import { DataEvents } from "./data-events";
import { getJohnsHopkinsCsseData } from "./tracker-api";

type Fetched = Location[];
type Transformed = SmsReady;

export class DataProvider {
  private cache: {
    fetched?: Fetched;
    transformed?: Transformed;
  };

  constructor(private dataHandler: DataHandler<Fetched, Transformed>) {
    this.pullNewData().catch(error => {
      console.error(
        "Data provider initialization failed during first data fetch."
      );
      throw error;
    });
  }

  /**
   * Fetches and caches corona tracker data.
   */
  async fetch(): Promise<Fetched> {
    try {
      return await this.getLocations();
    } catch (error) {
      console.error("Failed to fetch analytics data.");
      throw error;
    }
  }

  async getLocations(): Promise<Location[]> {
    return await getJohnsHopkinsCsseData();
  }

  private async pullNewData() {
    const fetched = await this.fetch();
    const transformed = this.dataHandler(fetched);
    this.cache = {
      ...this.cache,
      fetched,
      transformed
    };
    DataEvents.emit("NEW_DATA_AVAILABLE", transformed);
  }
}
