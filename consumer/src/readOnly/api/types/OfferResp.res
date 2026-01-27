open Enums
open OfferDescription
open Utils

@genType
type offerResp = {
  discountAmount: float,
  finalOrderAmount: float,
  offerDescription: offerDescription,
  offerId: string,
  orderAmount: float,
  status: OfferListStatus.offerListStatus,
}

let decodeOfferResp = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          discountAmount: getOptionFloat(dict, "discountAmount")->Option.getExn(
            ~message="discountAmount not found",
          ),
          finalOrderAmount: getOptionFloat(dict, "finalOrderAmount")->Option.getExn(
            ~message="finalOrderAmount not found",
          ),
          offerDescription: dict
          ->Dict.get("offerDescription")
          ->Option.getExn(~message="offerDescription is not found")
          ->decodeOfferDescription
          ->Utils.getResultExn(~message="offerDescription is coming as undefined"),
          offerId: getOptionString(dict, "offerId")->Option.getExn(~message="offerId not found"),
          orderAmount: getOptionFloat(dict, "orderAmount")->Option.getExn(
            ~message="orderAmount not found",
          ),
          status: OfferListStatus.decodeOfferListStatusResult(dict, "status")->Utils.getResultExn(
            ~message="status is coming as undefined",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("OfferResp ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: offerResp) => {
  req->asJson
}
