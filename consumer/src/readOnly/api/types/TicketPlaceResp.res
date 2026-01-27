open TicketPlace
open TicketSubPlace
open Utils

@genType
type ticketPlaceResp = {
  subPlaces: array<ticketSubPlace>,
  ticketPlace: ticketPlace,
}

let decodeTicketPlaceResp = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          subPlaces: dict
          ->Dict.get("subPlaces")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="subPlaces is not of array")
          ->Array.map(x =>
            decodeTicketSubPlace(x)->Utils.getResultExn(~message="subPlaces is coming as undefined")
          ),
          ticketPlace: dict
          ->Dict.get("ticketPlace")
          ->Option.getExn(~message="ticketPlace is not found")
          ->decodeTicketPlace
          ->Utils.getResultExn(~message="ticketPlace is coming as undefined"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("TicketPlaceResp ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: ticketPlaceResp) => {
  req->asJson
}
