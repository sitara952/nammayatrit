open Utils

@genType
type setupIntentResponse = {
  customerId: string,
  ephemeralKey: string,
  setupIntentClientSecret: string,
}

let decodeSetupIntentResponse = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          customerId: getOptionString(dict, "customerId")->Option.getExn(
            ~message="customerId not found",
          ),
          ephemeralKey: getOptionString(dict, "ephemeralKey")->Option.getExn(
            ~message="ephemeralKey not found",
          ),
          setupIntentClientSecret: getOptionString(dict, "setupIntentClientSecret")->Option.getExn(
            ~message="setupIntentClientSecret not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("SetupIntentResponse ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: setupIntentResponse) => {
  req->asJson
}
