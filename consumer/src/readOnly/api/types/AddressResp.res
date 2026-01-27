open Utils

@genType
type addressResp = {
  longName: string,
  shortName: string,
  types: array<string>,
}

let decodeAddressResp = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          longName: getOptionString(dict, "longName")->Option.getExn(~message="longName not found"),
          shortName: getOptionString(dict, "shortName")->Option.getExn(
            ~message="shortName not found",
          ),
          types: getOptionStrArrayFromDict(dict, "types")->Option.getExn(
            ~message="types not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("AddressResp ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: addressResp) => {
  req->asJson
}
