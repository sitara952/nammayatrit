open Utils

@genType
type addSosVideoRes = {fileUrl: string}

let decodeAddSosVideoRes = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          fileUrl: getOptionString(dict, "fileUrl")->Option.getExn(~message="fileUrl not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("AddSosVideoRes ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: addSosVideoRes) => {
  req->asJson
}
