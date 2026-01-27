open Utils

@genType
type bestOfferCombinationOffer = {
  cashbackAmount: float,
  discountAmount: float,
  merchantDiscountAmount: float,
  offerId: string,
  totalOfferedAmount: float,
}

let decodeBestOfferCombinationOffer = data => {
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
          merchantDiscountAmount: getOptionFloat(dict, "merchantDiscountAmount")->Option.getExn(
            ~message="merchantDiscountAmount not found",
          ),
          offerId: getOptionString(dict, "offerId")->Option.getExn(~message="offerId not found"),
          totalOfferedAmount: getOptionFloat(dict, "totalOfferedAmount")->Option.getExn(
            ~message="totalOfferedAmount not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("BestOfferCombinationOffer ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: bestOfferCombinationOffer) => {
  req->asJson
}
