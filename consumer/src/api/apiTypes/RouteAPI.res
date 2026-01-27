open Utils
open LatLong

type snapped = {snapped: array<latLong>}
type getRouteRequest = {
  calcPoints: bool,
  mode: option<string>,
  waypoints: array<latLong>,
}
type distanceUnit = Meter | Mile | Yard | Kilometer
type distanceWithUnit = {
  value: float,
  unit: distanceUnit,
}

@genType
type routeApiType = {
  points: array<latLong>,
  boundingBox: option<array<int>>,
  snappedWayPoints: array<latLong>,
  duration: int,
  distance: int,
  distanceWithUnit: distanceWithUnit,
}

type getRouteResponse = array<routeApiType>

let getSnapped = (dict, key) => {
  dict
  ->Dict.get(key)
  ->Option.flatMap(JSON.Decode.array)
  ->Option.getOr([])
  ->Array.filterMap(JSON.Decode.object)
  ->Array.map(dict => {
    LatLongUtils.getLatLon(dict)
  })
  ->Array.filterMap(x => x)
}

let getOptionPoints = (dict, key) =>
  switch getSnapped(dict, key) {
  | [] => None
  | points => Some(points)
  }

let getPoints = (dict, key) => {
  switch getOptionPoints(dict, key) {
  | Some(points) => Some({snapped: points})
  | None => None
  }
}

let makeGetRouteReq = (srcLat, srcLon, destLat, destLon, middleStopsLatLon) => {
  let srcPoint: latLong = {lat: srcLat, lon: srcLon}
  let destPoint: latLong = {lat: destLat, lon: destLon}
  let wayPoints = Array.concat(Array.concat([srcPoint], middleStopsLatLon), [destPoint])
  {
    calcPoints: true,
    mode: Some("CAR"),
    waypoints: wayPoints,
  }
}

let toJson = (req: getRouteRequest) => {
  req->asJson
}
let defaultDistanceUnit = Mile
let getUnit = (dict, key) => {
  dict
  ->Dict.get(key)
  ->Option.flatMap(JSON.Decode.string)
  ->Option.map(str => {
    switch str {
    | "Meter" => Meter
    | "Mile" => Mile
    | "Yard" => Yard
    | "Kilometer" => Kilometer

    | _ => Meter
    }
  })
  ->Option.getOr(defaultDistanceUnit)
}
let defaultDistance = {
  unit: defaultDistanceUnit,
  value: 0.,
}
let getDistanceWithUnit = (dict, key) => {
  dict
  ->Dict.get(key)
  ->Option.flatMap(JSON.Decode.object)
  ->Option.map(dict => {
    {
      unit: getUnit(dict, "unit"),
      value: getFloat(dict, "value", 0.),
    }
  })
  ->Option.getOr(defaultDistance)
}
let itemToObjectMapper = dict => {
  {
    points: getOptionPoints(dict, "points")->Option.getOr([]),
    boundingBox: getOptionIntArrayFromDict(dict, "boundingBox"),
    snappedWayPoints: getOptionPoints(dict, "snappedWayPoints")->Option.getOr([]),
    duration: getInt(dict, "duration", 0),
    distance: getInt(dict, "distance", 0),
    distanceWithUnit: getDistanceWithUnit(dict, "distanceWithUnit"),
  }
}

let routeItemToObjectMapper = dict => {
  dict
  ->Array.filterMap(JSON.Decode.object)
  ->Array.map(dict => itemToObjectMapper(dict))
}

@genType
let transformSnappedToLatLon = (latLong: latLong): ReactMap.latLng => {
  latitude: latLong.lat,
  longitude: latLong.lon,
}

@genType
let transformSnappedToRouteLatLon = (route: option<RouteInfo.routeInfo>): option<
  array<ReactMap.latLng>,
> => {
  let transformedRoute = route->Option.flatMap(x => x->asJson->jsonNullToOption->Option.map(_ => x))
  switch transformedRoute {
  | Some(route') => Some(route'.points->Array.map(transformSnappedToLatLon))
  | None => None
  }
}
