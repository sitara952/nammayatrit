open FRFSQuoteAPIRes
open Utils

@genType
type fRFSSearchAPIRes = {
  quotes: array<fRFSQuoteAPIRes>,
  searchId: string,
}

let decodeFRFSSearchAPIRes = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          quotes: dict
          ->Dict.get("quotes")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="quotes is not of array")
          ->Array.map(x =>
            decodeFRFSQuoteAPIRes(x)->Utils.getResultExn(~message="quotes is coming as undefined")
          ),
          searchId: getOptionString(dict, "searchId")->Option.getExn(~message="searchId not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("FRFSSearchAPIRes ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: fRFSSearchAPIRes) => {
  req->asJson
}
