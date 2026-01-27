open Utils

@genType
type referredCustomers = {count: int}

let decodeReferredCustomers = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          count: getOptionInt(dict, "count")->Option.getExn(~message="count not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("ReferredCustomers ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: referredCustomers) => {
  req->asJson
}
