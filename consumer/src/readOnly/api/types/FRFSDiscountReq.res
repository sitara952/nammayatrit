open Utils

@genType
type fRFSDiscountReq = {
  code: string,
  quantity: int,
}

let decodeFRFSDiscountReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          code: getOptionString(dict, "code")->Option.getExn(~message="code not found"),
          quantity: getOptionInt(dict, "quantity")->Option.getExn(~message="quantity not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("FRFSDiscountReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: fRFSDiscountReq) => {
  req->asJson
}
