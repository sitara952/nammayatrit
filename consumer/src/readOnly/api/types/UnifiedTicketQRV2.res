open BookingDataV2
open Utils

@genType
type unifiedTicketQRV2 = {
  _type: string,
  cmrl: array<bookingDataV2>,
  createdAt: string,
  mtc: array<bookingDataV2>,
  txnId: string,
  version: string,
}

let decodeUnifiedTicketQRV2 = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          _type: getOptionString(dict, "_type")->Option.getExn(~message="_type not found"),
          cmrl: dict
          ->Dict.get("cmrl")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="cmrl is not of array")
          ->Array.map(x =>
            decodeBookingDataV2(x)->Utils.getResultExn(~message="cmrl is coming as undefined")
          ),
          createdAt: getOptionString(dict, "createdAt")->Option.getExn(
            ~message="createdAt not found",
          ),
          mtc: dict
          ->Dict.get("mtc")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="mtc is not of array")
          ->Array.map(x =>
            decodeBookingDataV2(x)->Utils.getResultExn(~message="mtc is coming as undefined")
          ),
          txnId: getOptionString(dict, "txnId")->Option.getExn(~message="txnId not found"),
          version: getOptionString(dict, "version")->Option.getExn(~message="version not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("UnifiedTicketQRV2 ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: unifiedTicketQRV2) => {
  req->asJson
}
