open Utils

@genType
type callRes = {callId: string}

let decodeCallRes = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          callId: getOptionString(dict, "callId")->Option.getExn(~message="callId not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("CallRes ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: callRes) => {
  req->asJson
}
