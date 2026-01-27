open Enums
open OneWayMode
open TripCategoryCrossCity
open TripCategoryInterCity
open TripMode
open Utils

@genType
type tripCategory =
  | OneWay(oneWayMode)
  | Rental(tripMode)
  | RideShare(tripMode)
  | InterCity(tripCategoryInterCity)
  | CrossCity(tripCategoryCrossCity)
  | Ambulance(oneWayMode)
  | Delivery(oneWayMode)

let decodeTripCategory = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          switch getOptionString(dict, "tag") {
          | Some("OneWay") =>
            dict
            ->Dict.get("contents")
            ->Option.getExn(~message="contents is not found")
            ->decodeOneWayMode
            ->Result.map(x => OneWay(x))
            ->Utils.getResultExn(~message="contents is coming as undefined")
          | Some("Rental") =>
            dict
            ->Dict.get("contents")
            ->Option.getExn(~message="contents is not found")
            ->decodeTripMode
            ->Result.map(x => Rental(x))
            ->Utils.getResultExn(~message="contents is coming as undefined")
          | Some("RideShare") =>
            dict
            ->Dict.get("contents")
            ->Option.getExn(~message="contents is not found")
            ->decodeTripMode
            ->Result.map(x => RideShare(x))
            ->Utils.getResultExn(~message="contents is coming as undefined")
          | Some("InterCity") =>
            data
            ->decodeTripCategoryInterCity
            ->Result.map(x => InterCity(x))
            ->Utils.getResultExn(~message="contents is coming as undefined")
          | Some("CrossCity") =>
            data
            ->decodeTripCategoryCrossCity
            ->Result.map(x => CrossCity(x))
            ->Utils.getResultExn(~message="contents is coming as undefined")
          | Some("Ambulance") =>
            dict
            ->Dict.get("contents")
            ->Option.getExn(~message="contents is not found")
            ->decodeOneWayMode
            ->Result.map(x => Ambulance(x))
            ->Utils.getResultExn(~message="contents is coming as undefined")
          | Some("Delivery") =>
            dict
            ->Dict.get("contents")
            ->Option.getExn(~message="contents is not found")
            ->decodeOneWayMode
            ->Result.map(x => Delivery(x))
            ->Utils.getResultExn(~message="contents is coming as undefined")
          | _ => Js.Exn.raiseError("Invalid tag value")
          }
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("TripCategory ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: tripCategory) => {
  req->asJson
}
