open Utils

@genType
type createCustomerResp = {
  clientAuthToken: option<string>,
  clientAuthTokenExpiry: option<string>,
  customerId: string,
}

let decodeCreateCustomerResp = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          clientAuthToken: getOptionString(dict, "clientAuthToken"),
          clientAuthTokenExpiry: getOptionString(dict, "clientAuthTokenExpiry"),
          customerId: getOptionString(dict, "customerId")->Option.getExn(
            ~message="customerId not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("CreateCustomerResp ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: createCustomerResp) => {
  req->asJson
}
