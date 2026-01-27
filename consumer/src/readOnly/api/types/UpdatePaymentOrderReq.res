open Utils

@genType
type updatePaymentOrderReq = {
  childTicketQuantity: int,
  quantity: int,
}

let decodeUpdatePaymentOrderReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          childTicketQuantity: getOptionInt(dict, "childTicketQuantity")->Option.getExn(
            ~message="childTicketQuantity not found",
          ),
          quantity: getOptionInt(dict, "quantity")->Option.getExn(~message="quantity not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("UpdatePaymentOrderReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: updatePaymentOrderReq) => {
  req->asJson
}
