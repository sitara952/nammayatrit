open Utils

@genType
type driverNo = {driverNumber: string}

let decodeDriverNo = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          driverNumber: getOptionString(dict, "driverNumber")->Option.getExn(
            ~message="driverNumber not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("DriverNo ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: driverNo) => {
  req->asJson
}
