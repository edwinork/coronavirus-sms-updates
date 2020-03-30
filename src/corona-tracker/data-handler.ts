import { Config, Location, SmsReady } from "../types";

type Sorted = {
  countries: {
    [countryName: string]: Location;
  };
  provinces: {
    [provinceName: string]: Location;
  };
};

export function getDataHandler(config: Config) {
  return (data: Location[]) => transform(find(config.find.location, data));
}

function transform(location: Location): SmsReady {
  const {
    country,
    province,
    updatedAt: lastUpdated,
    coordinates,
    stats: statistics
  } = location;
  const type = location.province === null ? "country" : "province";

  return {
    location: {
      type,
      name: type === "country" ? country : `${country}, ${province}`,
      coordinates,
      statistics,
      lastUpdated
    }
  };
}

export function find(location: string, data: Location[]) {
  if (!data || data.length === 0) {
    throw new Error("Cannot find requested location. No data available.");
  }

  const reducer = (sorted: Sorted, current: Location): Sorted => {
    return !current.province
      ? appendCountry(sorted, current)
      : appendProvince(sorted, current);
  };

  let sortedLocations = { countries: {}, provinces: {} };
  sortedLocations = data.reduce(reducer, sortedLocations);

  return findLocation(location, sortedLocations);
}

function findLocation(location: string, { countries, provinces }: Sorted) {
  const found = provinces[location] ?? countries[location];

  if (!found) {
    throw new Error(
      `Cannot find requested location: ${location}.
      Available locations are: 
      COUNTRIES: [${Object.keys(countries).join(",")}]
      PROVINCES: [${Object.keys(provinces).join(",")}]`
    );
  }

  return found;
}

function appendCountry(sortedByType: Sorted, location: Location): Sorted {
  const name = location.country;
  const countries = {
    ...sortedByType.countries,
    [name]: location
  };
  return {
    ...sortedByType,
    countries
  };
}

function appendProvince(sortedByType: Sorted, location: Location): Sorted {
  const name = location.province;
  const provinces = {
    ...sortedByType.provinces,
    [name]: location
  };
  return {
    ...sortedByType,
    provinces
  };
}
