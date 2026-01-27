open Utils

@genType
type fRFSTicketVerifyReq = {qrData: string}

let decodeFRFSTicketVerifyReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          qrData: getOptionString(dict, "qrData")->Option.getExn(~message="qrData not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("FRFSTicketVerifyReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: fRFSTicketVerifyReq) => {
  req->asJson
}
