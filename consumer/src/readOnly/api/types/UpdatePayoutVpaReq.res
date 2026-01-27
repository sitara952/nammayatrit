open Utils

@genType
type updatePayoutVpaReq = {vpa: string}

let decodeUpdatePayoutVpaReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          vpa: getOptionString(dict, "vpa")->Option.getExn(~message="vpa not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("UpdatePayoutVpaReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: updatePayoutVpaReq) => {
  req->asJson
}
