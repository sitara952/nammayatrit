open Utils

@genType
type attraction = {
  distanceInKm: float,
  id: string,
  name: string,
}

let decodeAttraction = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          distanceInKm: getOptionFloat(dict, "distanceInKm")->Option.getExn(
            ~message="distanceInKm not found",
          ),
          id: getOptionString(dict, "id")->Option.getExn(~message="id not found"),
          name: getOptionString(dict, "name")->Option.getExn(~message="name not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("Attraction ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: attraction) => {
  req->asJson
}
