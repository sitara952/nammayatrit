open BookingData
open Utils

@genType
type unifiedTicketQR = {
  _type: string,
  cmrl: array<bookingData>,
  createdAt: string,
  mtc: array<bookingData>,
  txnId: string,
  version: string,
}

let decodeUnifiedTicketQR = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          _type: getOptionString(dict, "type")->Option.getExn(~message="type not found"),
          cmrl: dict
          ->Dict.get("cmrl")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="cmrl is not of array")
          ->Array.map(x =>
            decodeBookingData(x)->Utils.getResultExn(~message="cmrl is coming as undefined")
          ),
          createdAt: getOptionString(dict, "createdAt")->Option.getExn(
            ~message="createdAt not found",
          ),
          mtc: dict
          ->Dict.get("mtc")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="mtc is not of array")
          ->Array.map(x =>
            decodeBookingData(x)->Utils.getResultExn(~message="mtc is coming as undefined")
          ),
          txnId: getOptionString(dict, "txnId")->Option.getExn(~message="txnId not found"),
          version: getOptionString(dict, "version")->Option.getExn(~message="version not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("UnifiedTicketQR ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: unifiedTicketQR) => {
  req->asJson
}
