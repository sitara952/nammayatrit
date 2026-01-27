open LegDetails
open Price
open Utils

@genType
type journeyDetails = {
  legDetails: array<legDetails>,
  totalFare: price,
}

let decodeJourneyDetails = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          legDetails: dict
          ->Dict.get("legDetails")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="legDetails is not of array")
          ->Array.map(x =>
            decodeLegDetails(x)->Utils.getResultExn(~message="legDetails is coming as undefined")
          ),
          totalFare: dict
          ->Dict.get("totalFare")
          ->Option.getExn(~message="totalFare is not found")
          ->decodePrice
          ->Utils.getResultExn(~message="totalFare is coming as undefined"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("JourneyDetails ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: journeyDetails) => {
  req->asJson
}
