open FRFSQuoteAPIRes
open Utils

@genType
type getFareRespV2 = {
  quotes: option<array<fRFSQuoteAPIRes>>,
  searchId: string,
}

let decodeGetFareRespV2 = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          quotes: dict
          ->Dict.get("quotes")
          ->Option.flatMap(jsonNullToOption)
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.map(arr =>
            arr->Array.map(x =>
              decodeFRFSQuoteAPIRes(x)->Utils.getResultExn(~message="quotes is coming as undefined")
            )
          ),
          searchId: getOptionString(dict, "searchId")->Option.getExn(~message="searchId not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("GetFareRespV2 ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: getFareRespV2) => {
  req->asJson
}
