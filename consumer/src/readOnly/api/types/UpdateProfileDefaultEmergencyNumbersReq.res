open PersonDefaultEmergencyNumber
open Utils

@genType
type updateProfileDefaultEmergencyNumbersReq = {
  defaultEmergencyNumbers: array<personDefaultEmergencyNumber>,
}

let decodeUpdateProfileDefaultEmergencyNumbersReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          defaultEmergencyNumbers: dict
          ->Dict.get("defaultEmergencyNumbers")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="defaultEmergencyNumbers is not of array")
          ->Array.map(x =>
            decodePersonDefaultEmergencyNumber(x)->Utils.getResultExn(
              ~message="defaultEmergencyNumbers is coming as undefined",
            )
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("UpdateProfileDefaultEmergencyNumbersReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: updateProfileDefaultEmergencyNumbersReq) => {
  req->asJson
}
