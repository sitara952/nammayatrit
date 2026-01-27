open Enums
open BookingAPIEntity
open Utils

@genType
type generateInvoiceRes = {
  bookingAPIEntities: array<bookingAPIEntity>,
  invoiceId: string,
  message: string,
  status: InvoiceStatus.invoiceStatus,
  totalAmount: option<float>,
  totalBookings: int,
}

let decodeGenerateInvoiceRes = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          bookingAPIEntities: dict
          ->Dict.get("bookingAPIEntities")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="bookingAPIEntities is not of array")
          ->Array.map(x =>
            decodeBookingAPIEntity(x)->Utils.getResultExn(
              ~message="bookingAPIEntities is coming as undefined",
            )
          ),
          invoiceId: getOptionString(dict, "invoiceId")->Option.getExn(
            ~message="invoiceId not found",
          ),
          message: getOptionString(dict, "message")->Option.getExn(~message="message not found"),
          status: InvoiceStatus.decodeInvoiceStatusResult(dict, "status")->Utils.getResultExn(
            ~message="status is coming as undefined",
          ),
          totalAmount: getOptionFloat(dict, "totalAmount"),
          totalBookings: getOptionInt(dict, "totalBookings")->Option.getExn(
            ~message="totalBookings not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("GenerateInvoiceRes ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: generateInvoiceRes) => {
  req->asJson
}
