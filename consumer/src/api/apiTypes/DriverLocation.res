open Utils

// Defines a type for driver location with last update time, latitude, and longitude.
@genType
type rideIdDriverLocationType = {
  lastUpdate: string,
  lat: option<float>,
  lon: option<float>,
}

// Maps a dictionary to a rideIdDriverLocationType object.
let itemToObjectMapper = dict => {
  {
    lastUpdate: getString(dict, "lastUpdate", ""),
    lat: getOptionFloat(dict, "lat"),
    lon: getOptionFloat(dict, "lon"),
  }
}
