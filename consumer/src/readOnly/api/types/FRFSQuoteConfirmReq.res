open CrisSdkResponse
open FRFSCategorySelectionReq
open Utils

@genType
type fRFSQuoteConfirmReq = {
  childTicketQuantity: option<int>,
  crisSdkResponse: option<crisSdkResponse>,
  enableOffer: option<bool>,
  offered: option<array<fRFSCategorySelectionReq>>,
  ticketQuantity: option<int>,
}

let decodeFRFSQuoteConfirmReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          childTicketQuantity: getOptionInt(dict, "childTicketQuantity"),
          crisSdkResponse: dict
          ->Dict.get("crisSdkResponse")
          ->Option.flatMap(jsonNullToOption)
          ->Option.mapOr(None, x => decodeCrisSdkResponse(x)->Result.mapOr(None, x => Some(x))),
          enableOffer: getOptionBool(dict, "enableOffer"),
          offered: dict
          ->Dict.get("offered")
          ->Option.flatMap(jsonNullToOption)
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.map(arr =>
            arr->Array.map(x =>
              decodeFRFSCategorySelectionReq(x)->Utils.getResultExn(
                ~message="offered is coming as undefined",
              )
            )
          ),
          ticketQuantity: getOptionInt(dict, "ticketQuantity"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("FRFSQuoteConfirmReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: fRFSQuoteConfirmReq) => {
  req->asJson
}
