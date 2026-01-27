open Utils

@genType
type fRFSStationAPI = {
  address: option<string>,
  code: string,
  hindiName: option<string>,
  lat: option<float>,
  lon: option<float>,
  name: option<string>,
  parentStopCode: option<string>,
  timeTakenToTravelUpcomingStop: option<int>,
  regionalName: option<string>,
  routeCodes: option<array<string>>,
}

let decodeFRFSStationAPI = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          address: getOptionString(dict, "address"),
          code: getOptionString(dict, "code")->Option.getExn(~message="code not found"),
          hindiName: getOptionString(dict, "hindiName"),
          lat: getOptionFloat(dict, "lat"),
          lon: getOptionFloat(dict, "lon"),
          name: getOptionString(dict, "name"),
          parentStopCode: getOptionString(dict, "parentStopCode"),
          regionalName: getOptionString(dict, "regionalName"),
          routeCodes: getOptionStrArray(dict, "routeCodes"),
          timeTakenToTravelUpcomingStop: getOptionInt(dict, "timeTakenToTravelUpcomingStop"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("FRFSStationAPI ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: fRFSStationAPI) => {
  req->asJson
}
