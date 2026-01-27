open EmergencyContactId
open Utils

@genType
type sosType =
  | Police
  | CustomerCare
  | EmergencyContact(emergencyContactId)
  | SafetyFlow
  | CSAlertSosTicket
  | AudioRecording

let decodeSosType = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          switch getOptionString(dict, "tag") {
          | Some("Police") => Police
          | Some("CustomerCare") => CustomerCare
          | Some("EmergencyContact") =>
            dict
            ->Dict.get("contents")
            ->Option.getExn(~message="contents is not found")
            ->decodeEmergencyContactId
            ->Result.map(x => EmergencyContact(x))
            ->Utils.getResultExn(~message="contents is coming as undefined")
          | Some("SafetyFlow") => SafetyFlow
          | Some("CSAlertSosTicket") => CSAlertSosTicket
          | Some("AudioRecording") => AudioRecording
          | _ => Js.Exn.raiseError("Invalid tag value")
          }
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("SosType ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: sosType) => {
  req->asJson
}
