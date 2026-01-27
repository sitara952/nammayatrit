open Utils
open LatLong

let getLatLon = dict => {
  let lat = getOptionFloat(dict, "lat")
  let lon = getOptionFloat(dict, "lon")
  switch (lat, lon) {
  | (Some(lat), Some(lon)) => Some({lat, lon})
  | _ => None
  }
}

let extractLatLon = (dict, key) => {
  dict
  ->Dict.get(key)
  ->Option.flatMap(JSON.Decode.object)
  ->Option.flatMap(dict => {
    getLatLon(dict)
  })
}
