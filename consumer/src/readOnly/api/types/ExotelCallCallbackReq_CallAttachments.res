open Enums
open CallAttachments
open ExotelLeg
open Utils

@genType
type exotelCallCallbackReq_CallAttachments = {
  callSid: string,
  conversationDuration: int,
  customField: callAttachments,
  dateCreated: string,
  dateUpdated: string,
  direction: ExotelDirection.exotelDirection,
  endTime: string,
  eventType: string,
  from: string,
  legs: array<exotelLeg>,
  phoneNumberSid: string,
  recordingUrl: string,
  startTime: string,
  status: ExotelCallStatus.exotelCallStatus,
  to: string,
}

let decodeExotelCallCallbackReq_CallAttachments = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          callSid: getOptionString(dict, "callSid")->Option.getExn(~message="callSid not found"),
          conversationDuration: getOptionInt(dict, "conversationDuration")->Option.getExn(
            ~message="conversationDuration not found",
          ),
          customField: dict
          ->Dict.get("customField")
          ->Option.getExn(~message="customField is not found")
          ->decodeCallAttachments
          ->Utils.getResultExn(~message="customField is coming as undefined"),
          dateCreated: getOptionString(dict, "dateCreated")->Option.getExn(
            ~message="dateCreated not found",
          ),
          dateUpdated: getOptionString(dict, "dateUpdated")->Option.getExn(
            ~message="dateUpdated not found",
          ),
          direction: ExotelDirection.decodeExotelDirectionResult(
            dict,
            "direction",
          )->Utils.getResultExn(~message="direction is coming as undefined"),
          endTime: getOptionString(dict, "endTime")->Option.getExn(~message="endTime not found"),
          eventType: getOptionString(dict, "eventType")->Option.getExn(
            ~message="eventType not found",
          ),
          from: getOptionString(dict, "from")->Option.getExn(~message="from not found"),
          legs: dict
          ->Dict.get("legs")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="legs is not of array")
          ->Array.map(x =>
            decodeExotelLeg(x)->Utils.getResultExn(~message="legs is coming as undefined")
          ),
          phoneNumberSid: getOptionString(dict, "phoneNumberSid")->Option.getExn(
            ~message="phoneNumberSid not found",
          ),
          recordingUrl: getOptionString(dict, "recordingUrl")->Option.getExn(
            ~message="recordingUrl not found",
          ),
          startTime: getOptionString(dict, "startTime")->Option.getExn(
            ~message="startTime not found",
          ),
          status: ExotelCallStatus.decodeExotelCallStatusResult(dict, "status")->Utils.getResultExn(
            ~message="status is coming as undefined",
          ),
          to: getOptionString(dict, "to")->Option.getExn(~message="to not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("ExotelCallCallbackReq_CallAttachments ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: exotelCallCallbackReq_CallAttachments) => {
  req->asJson
}
