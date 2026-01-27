open MetroRide
open Utils

@genType
type metroOffer = {
  createdAt: string,
  description: string,
  rideSearchId: string,
  rides: array<metroRide>,
}

let decodeMetroOffer = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          createdAt: getOptionString(dict, "createdAt")->Option.getExn(
            ~message="createdAt not found",
          ),
          description: getOptionString(dict, "description")->Option.getExn(
            ~message="description not found",
          ),
          rideSearchId: getOptionString(dict, "rideSearchId")->Option.getExn(
            ~message="rideSearchId not found",
          ),
          rides: dict
          ->Dict.get("rides")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="rides is not of array")
          ->Array.map(x =>
            decodeMetroRide(x)->Utils.getResultExn(~message="rides is coming as undefined")
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("MetroOffer ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: metroOffer) => {
  req->asJson
}
