open PublicTransportStation
open Utils

@genType
type publicTransportQuote = {
  arrivalStation: publicTransportStation,
  arrivalTime: string,
  createdAt: string,
  departureStation: publicTransportStation,
  departureTime: string,
  description: string,
  fare: int,
  id: string,
}

let decodePublicTransportQuote = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          arrivalStation: dict
          ->Dict.get("arrivalStation")
          ->Option.getExn(~message="arrivalStation is not found")
          ->decodePublicTransportStation
          ->Utils.getResultExn(~message="arrivalStation is coming as undefined"),
          arrivalTime: getOptionString(dict, "arrivalTime")->Option.getExn(
            ~message="arrivalTime not found",
          ),
          createdAt: getOptionString(dict, "createdAt")->Option.getExn(
            ~message="createdAt not found",
          ),
          departureStation: dict
          ->Dict.get("departureStation")
          ->Option.getExn(~message="departureStation is not found")
          ->decodePublicTransportStation
          ->Utils.getResultExn(~message="departureStation is coming as undefined"),
          departureTime: getOptionString(dict, "departureTime")->Option.getExn(
            ~message="departureTime not found",
          ),
          description: getOptionString(dict, "description")->Option.getExn(
            ~message="description not found",
          ),
          fare: getOptionInt(dict, "fare")->Option.getExn(~message="fare not found"),
          id: getOptionString(dict, "id")->Option.getExn(~message="id not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("PublicTransportQuote ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: publicTransportQuote) => {
  req->asJson
}
