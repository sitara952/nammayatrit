open Enums
open Utils

@genType
type notifyEventReq = {event: FrontendEvent.frontendEvent}

let decodeNotifyEventReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          event: FrontendEvent.decodeFrontendEventResult(dict, "event")->Utils.getResultExn(
            ~message="event is coming as undefined",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("NotifyEventReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: notifyEventReq) => {
  req->asJson
}
