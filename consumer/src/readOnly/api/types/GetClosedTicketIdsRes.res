open CloseTicketResp
open Utils

@genType
type getClosedTicketIdsRes = {closedTicketIds: array<closeTicketResp>}

let decodeGetClosedTicketIdsRes = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          closedTicketIds: dict
          ->Dict.get("closedTicketIds")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="closedTicketIds is not of array")
          ->Array.map(x =>
            decodeCloseTicketResp(x)->Utils.getResultExn(
              ~message="closedTicketIds is coming as undefined",
            )
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("GetClosedTicketIdsRes ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: getClosedTicketIdsRes) => {
  req->asJson
}
