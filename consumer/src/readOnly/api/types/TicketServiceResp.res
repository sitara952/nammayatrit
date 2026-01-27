open BusinessHourResp
open ExpiryType
open Utils

@genType
type ticketServiceResp = {
  allowCancellation: bool,
  allowFutureBooking: bool,
  businessHours: array<businessHourResp>,
  expiry: expiryType,
  id: string,
  maxVerification: int,
  name: string,
  noteInfo: option<string>,
  placesId: string,
  priority: option<int>,
  serviceDetails: option<array<string>>,
  shortDesc: option<string>,
}

let decodeTicketServiceResp = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          allowCancellation: getOptionBool(dict, "allowCancellation")->Option.getExn(
            ~message="allowCancellation not found",
          ),
          allowFutureBooking: getOptionBool(dict, "allowFutureBooking")->Option.getExn(
            ~message="allowFutureBooking not found",
          ),
          businessHours: dict
          ->Dict.get("businessHours")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="businessHours is not of array")
          ->Array.map(x =>
            decodeBusinessHourResp(x)->Utils.getResultExn(
              ~message="businessHours is coming as undefined",
            )
          ),
          expiry: dict
          ->Dict.get("expiry")
          ->Option.getExn(~message="expiry is not found")
          ->decodeExpiryType
          ->Utils.getResultExn(~message="expiry is coming as undefined"),
          id: getOptionString(dict, "id")->Option.getExn(~message="id not found"),
          maxVerification: getOptionInt(dict, "maxVerification")->Option.getExn(
            ~message="maxVerification not found",
          ),
          name: getOptionString(dict, "name")->Option.getExn(~message="name not found"),
          noteInfo: getOptionString(dict, "noteInfo"),
          placesId: getOptionString(dict, "placesId")->Option.getExn(~message="placesId not found"),
          priority: getOptionInt(dict, "priority"),
          serviceDetails: getOptionStrArrayFromDict(dict, "serviceDetails"),
          shortDesc: getOptionString(dict, "shortDesc"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("TicketServiceResp ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: ticketServiceResp) => {
  req->asJson
}
