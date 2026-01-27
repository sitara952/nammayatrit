open Utils

@genType
type operationalDate = {
  eneDate: string,
  startDate: string,
}

let decodeOperationalDate = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          eneDate: getOptionString(dict, "eneDate")->Option.getExn(~message="eneDate not found"),
          startDate: getOptionString(dict, "startDate")->Option.getExn(
            ~message="startDate not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("OperationalDate ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: operationalDate) => {
  req->asJson
}
