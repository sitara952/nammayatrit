open EstimateBreakupPrice
open Utils

@genType
type estimateBreakup = {
  price: estimateBreakupPrice,
  title: string,
}

let decodeEstimateBreakup = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          price: dict
          ->Dict.get("price")
          ->Option.getExn(~message="price is not found")
          ->decodeEstimateBreakupPrice
          ->Utils.getResultExn(~message="price is coming as undefined"),
          title: getOptionString(dict, "title")->Option.getExn(~message="title not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("EstimateBreakup ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: estimateBreakup) => {
  req->asJson
}
