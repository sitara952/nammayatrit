open Enums
open SosType
open Utils

@genType
type sos = {
  createdAt: string,
  flow: sosType,
  id: string,
  merchantId: option<string>,
  merchantOperatingCityId: option<string>,
  personId: string,
  rideId: string,
  status: SosStatus.sosStatus,
  ticketId: option<string>,
  updatedAt: string,
}

let decodeSos = data => {
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
          flow: dict
          ->Dict.get("flow")
          ->Option.getExn(~message="flow is not found")
          ->decodeSosType
          ->Utils.getResultExn(~message="flow is coming as undefined"),
          id: getOptionString(dict, "id")->Option.getExn(~message="id not found"),
          merchantId: getOptionString(dict, "merchantId"),
          merchantOperatingCityId: getOptionString(dict, "merchantOperatingCityId"),
          personId: getOptionString(dict, "personId")->Option.getExn(~message="personId not found"),
          rideId: getOptionString(dict, "rideId")->Option.getExn(~message="rideId not found"),
          status: SosStatus.decodeSosStatusResult(dict, "status")->Utils.getResultExn(
            ~message="status is coming as undefined",
          ),
          ticketId: getOptionString(dict, "ticketId"),
          updatedAt: getOptionString(dict, "updatedAt")->Option.getExn(
            ~message="updatedAt not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("Sos ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: sos) => {
  req->asJson
}
