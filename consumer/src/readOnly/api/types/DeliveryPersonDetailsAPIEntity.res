open Utils

@genType
type deliveryPersonDetailsAPIEntity = {
  name: string,
  phoneNumber: string,
}

let decodeDeliveryPersonDetailsAPIEntity = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          name: getOptionString(dict, "name")->Option.getExn(~message="name not found"),
          phoneNumber: getOptionString(dict, "phoneNumber")->Option.getExn(
            ~message="phoneNumber not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("DeliveryPersonDetailsAPIEntity ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: deliveryPersonDetailsAPIEntity) => {
  req->asJson
}
