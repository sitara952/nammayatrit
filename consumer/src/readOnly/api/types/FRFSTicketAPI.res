open Enums
open Utils

@genType
type fRFSTicketAPI = {
  createdAt: string,
  description: option<string>,
  qrData: string,
  scannedByVehicleNumber: option<string>,
  status: FRFSTicketStatus.fRFSTicketStatus,
  ticketNumber: string,
  validTill: string,
}

let decodeFRFSTicketAPI = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          createdAt: getOptionString(dict, "createdAt")->Option.getExn(
            ~message="createdAt not found",
          ),
          description: getOptionString(dict, "description"),
          qrData: getOptionString(dict, "qrData")->Option.getExn(~message="qrData not found"),
          scannedByVehicleNumber: getOptionString(dict, "scannedByVehicleNumber"),
          status: FRFSTicketStatus.decodeFRFSTicketStatusResult(dict, "status")->Utils.getResultExn(
            ~message="status is coming as undefined",
          ),
          ticketNumber: getOptionString(dict, "ticketNumber")->Option.getExn(
            ~message="ticketNumber not found",
          ),
          validTill: getOptionString(dict, "validTill")->Option.getExn(
            ~message="validTill not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("FRFSTicketAPI ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: fRFSTicketAPI) => {
  req->asJson
}
