open CrisSdkResponse
open FRFSCategorySelectionReq
open Utils

@genType
type journeyConfirmReqElement = {
  categorySelectionReq: option<array<fRFSCategorySelectionReq>>,
  crisSdkResponse: option<crisSdkResponse>,
  journeyLegOrder: int,
  skipBooking: bool
}

let decodeJourneyConfirmReqElement = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          categorySelectionReq: dict
          ->Dict.get("categorySelectionReq")
          ->Option.flatMap(jsonNullToOption)
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.map(arr =>
            arr->Array.map(x =>
              decodeFRFSCategorySelectionReq(x)->Utils.getResultExn(
                ~message="categorySelectionReq is coming as undefined",
              )
            )
          ),
          crisSdkResponse: dict
          ->Dict.get("crisSdkResponse")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeCrisSdkResponse(x)->Result.mapOr(None, x => Some(x))),
          journeyLegOrder: getOptionInt(dict, "journeyLegOrder")->Option.getExn(
            ~message="journeyLegOrder not found",
          ),
          skipBooking: getOptionBool(dict, "skipBooking")->Option.getExn(
            ~message="skipBooking not found",
          )
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("JourneyConfirmReqElement ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: journeyConfirmReqElement) => {
  req->asJson
}
