open Distance
open PriceAPIEntity
open Utils

@genType
type oneWayQuoteAPIDetails = {
  distanceToNearestDriver: float,
  distanceToNearestDriverWithUnit: distance,
  tollCharges: option<priceAPIEntity>,
}

let decodeOneWayQuoteAPIDetails = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          distanceToNearestDriver: getOptionFloat(dict, "distanceToNearestDriver")->Option.getExn(
            ~message="distanceToNearestDriver not found",
          ),
          distanceToNearestDriverWithUnit: dict
          ->Dict.get("distanceToNearestDriverWithUnit")
          ->Option.getExn(~message="distanceToNearestDriverWithUnit is not found")
          ->decodeDistance
          ->Utils.getResultExn(~message="distanceToNearestDriverWithUnit is coming as undefined"),
          tollCharges: dict
          ->Dict.get("tollCharges")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodePriceAPIEntity(x)->Result.mapOr(None, x => Some(x))),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("OneWayQuoteAPIDetails ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: oneWayQuoteAPIDetails) => {
  req->asJson
}
