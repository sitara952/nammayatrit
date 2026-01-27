open Utils

@genType
type tempCodeRes = {tempCode: string}

let decodeTempCodeRes = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          tempCode: getOptionString(dict, "tempCode")->Option.getExn(~message="tempCode not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("TempCodeRes ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: tempCodeRes) => {
  req->asJson
}
