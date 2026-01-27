open Enums
open Utils

@genType
type fRFSVehicleServiceTierAPI = {
  _type: FRFSServiceTierType.fRFSServiceTierType,
  description: string,
  longName: string,
  providerCode: string,
  shortName: string,
}

let decodeFRFSVehicleServiceTierAPI = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          _type: FRFSServiceTierType.decodeFRFSServiceTierTypeResult(
            dict,
            "_type",
          )->Utils.getResultExn(~message="_type is coming as undefined"),
          description: getOptionString(dict, "description")->Option.getExn(
            ~message="description not found",
          ),
          longName: getOptionString(dict, "longName")->Option.getExn(~message="longName not found"),
          providerCode: getOptionString(dict, "providerCode")->Option.getExn(
            ~message="providerCode not found",
          ),
          shortName: getOptionString(dict, "shortName")->Option.getExn(
            ~message="shortName not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("FRFSVehicleServiceTierAPI ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: fRFSVehicleServiceTierAPI) => {
  req->asJson
}
