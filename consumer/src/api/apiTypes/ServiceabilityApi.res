open Utils
open LatLong
open HelperSaved

@genType
type hotSpotInfo = {
  centroidLatLong: option<latLong>,
  geoHash: string,
}

@genType
type geoJsonGeometry = {coordinates: array<latLong>}

@genType
type gatesInfoFull = {
  address: string,
  canQueueUpOnGate: bool,
  defaultDriverExtra: int,
  geoJson: option<geoJsonGeometry>,
  id: string,
  name: string,
  point: latLong,
  gateType: option<string>,
}

// Type => coordinates: [[[[lat, lon]]]]
let getCoordinates = (dict, key) => {
  dict
  ->Js.Dict.get(key)
  ->Belt.Option.flatMap(Js.Json.decodeArray)
  ->Belt.Option.getExn
  ->Belt.Array.get(0)
  ->Belt.Option.flatMap(Js.Json.decodeArray)
  ->Belt.Option.getExn
  ->Belt.Array.get(0)
  ->Belt.Option.flatMap(Js.Json.decodeArray)
  ->Belt.Option.getExn
  ->Belt.Array.map(arr => {
    let coords = arr->Js.Json.decodeArray->Belt.Option.getExn
    {
      lat: Belt.Array.get(coords, 1)->Belt.Option.flatMap(Js.Json.decodeNumber)->Belt.Option.getExn,
      lon: Belt.Array.get(coords, 0)->Belt.Option.flatMap(Js.Json.decodeNumber)->Belt.Option.getExn,
    }
  })
}

let arrToLatLon = (jsonList: Core__JSON.t) => {
  let decodedArray =
    Some(jsonList)
    ->Belt.Option.flatMap(Js.Json.decodeArray)
    ->Belt.Option.getExn
    ->Array.map(data => {
      let coords = data->Js.Json.decodeArray->Belt.Option.getExn
      {
        lat: Belt.Array.get(coords, 1)
        ->Belt.Option.flatMap(Js.Json.decodeNumber)
        ->Belt.Option.getExn,
        lon: Belt.Array.get(coords, 0)
        ->Belt.Option.flatMap(Js.Json.decodeNumber)
        ->Belt.Option.getExn,
      }
    })
  decodedArray
}

let getGeoJson = (dict, key) => {
  let geoJsonString: string =
    dict
    ->Dict.get(key)
    ->Option.flatMap(JSON.Decode.string)
    ->Option.getOr("")
  let parseCoordinates = (geoJsonString: string) => {
    try {
      if geoJsonString === "" {
        {coordinates: []}
      } else {
        let coordinatesArray =
          geoJsonString
          ->JSON.parseExn
          ->JSON.Decode.object
          ->Option.getOr(Dict.make())
          ->Dict.get("coordinates")
          ->Option.flatMap(JSON.Decode.array)
          ->Option.getOr([])
        let coordinatesData =
          coordinatesArray[0]
          ->Option.flatMap(JSON.Decode.array)
          ->Option.getOr([])
          ->Array.map(arrToLatLon)
        {coordinates: coordinatesData[0]->Option.getOr([])}
      }
    } catch {
    | error =>
      Console.log2("Error in fetching geoJson", error)
      {coordinates: []}
    }
  }

  let result = parseCoordinates(geoJsonString)
  result
}

@genType
type specialLocation = {
  id: string,
  category: string,
  gatesInfo: array<gatesInfoFull>,
  geoJson: geoJsonGeometry,
  locationName: string,
  locationType: string,
}

@genType
type serviceabilityApiReqType = {location: latLong}

@genType
type restrictedHours = {
  startTime: option<string>,
  endTime: option<string>,
}

@genType
type ptRestrictedHours = {
  metro: restrictedHours,
  subway: restrictedHours,
}

@genType
type serviceabilityApiRespType = {
  city: string,
  hotSpotInfo: array<hotSpotInfo>,
  serviceable: bool,
  specialLocation: option<specialLocation>,
  isMetroServiceable: option<bool>,
  isSubwayServiceable: option<bool>,
  ptRestrictedHours: option<ptRestrictedHours>,
}

let serviceabilityApiReqType = req => {
  req->asJson->JSON.stringify->Some
}

let toJson = req => {
  req->asJson
}

let getPoint = (dict, key) => {
  LatLongUtils.extractLatLon(dict, key)
}

let getGatesInfo = (dict, key) => {
  dict
  ->Dict.get(key)
  ->Option.flatMap(JSON.Decode.array)
  ->Option.getOr([])
  ->Array.filterMap(JSON.Decode.object)
  ->Array.map(dict => {
    let geoJsonFetched = getGeoJson(dict, "geoJson")
    {
      address: getOptionString(dict, "address")->Option.filter(x => x != "NULL")->Option.getOr(""), // TODO :: Fix this, will cause unexpected behaviour if special location adress is null from BE.
      canQueueUpOnGate: getOptionBool(dict, "canQueueUpOnGate")->Belt.Option.getExn,
      defaultDriverExtra: getOptionInt(dict, "defaultDriverExtra")->Belt.Option.getWithDefault(0),
      geoJson: geoJsonFetched.coordinates->Array.length == 0 ? None : {Some(geoJsonFetched)},
      id: getOptionString(dict, "id")->Belt.Option.getExn,
      name: getOptionString(dict, "name")->Belt.Option.getExn,
      point: getPoint(dict, "point")->Belt.Option.getExn,
      gateType: getOptionString(dict, "gateType"),
    }
  })
}

let getSpecialLocation = (dict, key) => {
  dict
  ->Dict.get(key)
  ->Option.flatMap(JSON.Decode.object)
  ->Option.map(dict => {
    {
      id: getString(dict, "id", ""),
      category: getString(dict, "category", ""),
      gatesInfo: getGatesInfo(dict, "gatesInfo"),
      geoJson: getGeoJson(dict, "geoJson"),
      locationName: getString(dict, "locationName", ""),
      locationType: getString(dict, "locationType", ""),
    }
  })
}

let getCentroidLatLong = (dict, key) => LatLongUtils.extractLatLon(dict, key)

let defaultHotSpotInfo = {
  centroidLatLong: None,
  geoHash: "",
}

let getHotSpotInfo = (dict, key) => {
  dict
  ->Dict.get(key)
  ->Option.flatMap(JSON.Decode.array)
  ->Option.getOr([])
  ->Array.filterMap(JSON.Decode.object)
  ->Array.map(dict => {
    {
      centroidLatLong: getCentroidLatLong(dict, "centroidLatLong"),
      geoHash: getString(dict, "geoHash", ""),
    }
  })
}

let getRestrictedHours = (dict, key) => {
  dict
  ->Dict.get(key)
  ->Option.flatMap(JSON.Decode.object)
  ->Option.getOr(Dict.make())
  ->(
    dict => {
      {
        startTime: getOptionString(dict, "startTime"),
        endTime: getOptionString(dict, "endTime"),
      }
    }
  )
}

let getPtRestrictedHours = (dict, key) => {
  dict
  ->Dict.get(key)
  ->Option.flatMap(JSON.Decode.object)
  ->Option.map(dict => {
    {
      metro: getRestrictedHours(dict, "metro"),
      subway: getRestrictedHours(dict, "subway"),
    }
  })
}

let jsonToServiceabilityApiResType = res => {
  let dict = res->getDictFromJson

  {
    city: getString(dict, "city", ""),
    hotSpotInfo: getHotSpotInfo(dict, "hotSpotInfo"),
    serviceable: getBool(dict, "serviceable", false),
    specialLocation: getSpecialLocation(dict, "specialLocation"),
    isMetroServiceable: getOptionBool(dict, "isMetroServiceable"),
    isSubwayServiceable: getOptionBool(dict, "isSubwayServiceable"),
    ptRestrictedHours: getPtRestrictedHours(dict, "ptRestrictedHours"),
  }
}

let mkCheckServiceableReq = (lat, lon) => {
  location: {
    lat,
    lon,
  },
}
