open LocationAddress
open Utils

@genType
type personDetails = {
  address: locationAddress,
  countryCode: option<string>,
  name: string,
  phoneNumber: string,
}

let decodePersonDetails = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          address: dict
          ->Dict.get("address")
          ->Option.getExn(~message="address is not found")
          ->decodeLocationAddress
          ->Utils.getResultExn(~message="address is coming as undefined"),
          countryCode: getOptionString(dict, "countryCode"),
          name: getOptionString(dict, "name")->Option.getExn(~message="name not found"),
          phoneNumber: getOptionString(dict, "phoneNumber")->Option.getExn(
            ~message="phoneNumber not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("PersonDetails ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: personDetails) => {
  req->asJson
}
