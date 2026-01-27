open ActiveTicketsRes
open Utils

@genType
type getAllActiveTicketsRes = {activeTickets: array<activeTicketsRes>}

let decodeGetAllActiveTicketsRes = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          activeTickets: dict
          ->Dict.get("activeTickets")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="activeTickets is not of array")
          ->Array.map(x =>
            decodeActiveTicketsRes(x)->Utils.getResultExn(
              ~message="activeTickets is coming as undefined",
            )
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("GetAllActiveTicketsRes ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: getAllActiveTicketsRes) => {
  req->asJson
}
