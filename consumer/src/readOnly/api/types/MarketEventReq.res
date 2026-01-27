open MarketingParams
open Utils

@genType
type marketEventReq = {
  marketingParams: marketingParams,
  merchantName: string,
}

let decodeMarketEventReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          marketingParams: dict
          ->Dict.get("marketingParams")
          ->Option.getExn(~message="marketingParams is not found")
          ->decodeMarketingParams
          ->Utils.getResultExn(~message="marketingParams is coming as undefined"),
          merchantName: getOptionString(dict, "merchantName")->Option.getExn(
            ~message="merchantName not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("MarketEventReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: marketEventReq) => {
  req->asJson
}
