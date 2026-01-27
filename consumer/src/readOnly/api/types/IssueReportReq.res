open Chat
open Utils

@genType
type issueReportReq = {
  categoryId: string,
  chats: option<array<chat>>,
  createTicket: option<bool>,
  description: string,
  mediaFiles: array<string>,
  optionId: option<string>,
  rideId: option<string>,
  ticketBookingId: option<string>,
}

let decodeIssueReportReq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          categoryId: getOptionString(dict, "categoryId")->Option.getExn(
            ~message="categoryId not found",
          ),
          chats: dict
          ->Dict.get("chats")
          ->Option.flatMap(jsonNullToOption)
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.map(arr =>
            arr->Array.map(x =>
              decodeChat(x)->Utils.getResultExn(~message="chats is coming as undefined")
            )
          ),
          createTicket: getOptionBool(dict, "createTicket"),
          description: getOptionString(dict, "description")->Option.getExn(
            ~message="description not found",
          ),
          mediaFiles: getOptionStrArrayFromDict(dict, "mediaFiles")->Option.getExn(
            ~message="mediaFiles not found",
          ),
          optionId: getOptionString(dict, "optionId"),
          rideId: getOptionString(dict, "rideId"),
          ticketBookingId: getOptionString(dict, "ticketBookingId"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("IssueReportReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: issueReportReq) => {
  req->asJson
}
