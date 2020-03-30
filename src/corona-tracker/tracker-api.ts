import axios from "axios";
import { TrackerData } from "../types";

export const apiBaseUrl = "https://corona.lmao.ninja" as const;

export const getJohnsHopkinsCsseData = async () => {
  const { data } = await axios.get<TrackerData["jhucsse"]>(
    `${apiBaseUrl}/v2/jhucsse`
  );
  return data;
};
