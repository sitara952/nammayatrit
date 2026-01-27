open Utils

@genType
type deletedPersonReq = {reasonToDelete: option<string>}

let decodeDeletedPersonReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          reasonToDelete: getOptionString(dict, "reasonToDelete"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("DeletedPersonReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: deletedPersonReq) => {
  req->asJson
}
