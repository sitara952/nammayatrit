open Utils

@genType
type ticketKaptureResp = {
  encryptedCc: string,
  encryptedIv: string,
}

let decodeTicketKaptureResp = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          encryptedCc: getOptionString(dict, "encryptedCc")->Option.getExn(
            ~message="encryptedCc not found",
          ),
          encryptedIv: getOptionString(dict, "encryptedIv")->Option.getExn(
            ~message="encryptedIv not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("TicketKaptureResp ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: ticketKaptureResp) => {
  req->asJson
}
