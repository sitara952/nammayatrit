open Utils

@genType
type placesRequest = {
  integratedBppConfigId: string,
  userLat: float,
  userLon: float,
}

let decodePlacesRequest = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          integratedBppConfigId: getOptionString(dict, "integratedBppConfigId")->Option.getExn(
            ~message="integratedBppConfigId not found",
          ),
          userLat: getOptionFloat(dict, "userLat")->Option.getExn(~message="userLat not found"),
          userLon: getOptionFloat(dict, "userLon")->Option.getExn(~message="userLon not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("PlacesRequest ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: placesRequest) => {
  req->asJson
}
