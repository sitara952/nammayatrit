open ContactsDetail
open Utils

@genType
type emergencyContactsStatusRes = {details: array<contactsDetail>}

let decodeEmergencyContactsStatusRes = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          details: dict
          ->Dict.get("details")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="details is not of array")
          ->Array.map(x =>
            decodeContactsDetail(x)->Utils.getResultExn(~message="details is coming as undefined")
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("EmergencyContactsStatusRes ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: emergencyContactsStatusRes) => {
  req->asJson
}
