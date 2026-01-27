open Utils

@genType
type sosRes = {sosId: string}

let decodeSosRes = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          sosId: getOptionString(dict, "sosId")->Option.getExn(~message="sosId not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("SosRes ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: sosRes) => {
  req->asJson
}
