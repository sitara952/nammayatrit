open Enums
open Utils

@genType
type driverIdentifier = {
  _type: DriverIdentifierType.driverIdentifierType,
  value: string,
}

let decodeDriverIdentifier = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          _type: DriverIdentifierType.decodeDriverIdentifierTypeResult(
            dict,
            "type",
          )->Utils.getResultExn(~message="type is coming as undefined"),
          value: getOptionString(dict, "value")->Option.getExn(~message="value not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("DriverIdentifier ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: driverIdentifier) => {
  req->asJson
}
