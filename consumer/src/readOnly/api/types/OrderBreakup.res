open Utils

@genType
type orderBreakup = {
  cashbackAmount: float,
  discountAmount: float,
  finalOrderAmount: float,
  merchantDiscountAmount: float,
  offerAmount: float,
  orderAmount: float,
}

let decodeOrderBreakup = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          cashbackAmount: getOptionFloat(dict, "cashbackAmount")->Option.getExn(
            ~message="cashbackAmount not found",
          ),
          discountAmount: getOptionFloat(dict, "discountAmount")->Option.getExn(
            ~message="discountAmount not found",
          ),
          finalOrderAmount: getOptionFloat(dict, "finalOrderAmount")->Option.getExn(
            ~message="finalOrderAmount not found",
          ),
          merchantDiscountAmount: getOptionFloat(dict, "merchantDiscountAmount")->Option.getExn(
            ~message="merchantDiscountAmount not found",
          ),
          offerAmount: getOptionFloat(dict, "offerAmount")->Option.getExn(
            ~message="offerAmount not found",
          ),
          orderAmount: getOptionFloat(dict, "orderAmount")->Option.getExn(
            ~message="orderAmount not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("OrderBreakup ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: orderBreakup) => {
  req->asJson
}
