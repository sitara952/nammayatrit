open PersonDefaultEmergencyNumberAPIEntity
open Utils

@genType
type getProfileDefaultEmergencyNumbersResp = {
  defaultEmergencyNumbers: array<personDefaultEmergencyNumberAPIEntity>,
}

let decodeGetProfileDefaultEmergencyNumbersResp = data => {
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
            decodePersonDefaultEmergencyNumberAPIEntity(x)->Utils.getResultExn(
              ~message="defaultEmergencyNumbers is coming as undefined",
            )
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("GetProfileDefaultEmergencyNumbersResp ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: getProfileDefaultEmergencyNumbersResp) => {
  req->asJson
}
