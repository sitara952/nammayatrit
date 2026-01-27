open Utils

@genType
type followRideCustomerDetailsRes = {
  bookingId: string,
  customerName: string,
  customerPhone: option<string>,
}

let decodeFollowRideCustomerDetailsRes = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          bookingId: getOptionString(dict, "bookingId")->Option.getExn(
            ~message="bookingId not found",
          ),
          customerName: getOptionString(dict, "customerName")->Option.getExn(
            ~message="customerName not found",
          ),
          customerPhone: getOptionString(dict, "customerPhone"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("FollowRideCustomerDetailsRes ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: followRideCustomerDetailsRes) => {
  req->asJson
}
