open AmbulanceBookingAPIDetails
open DeliveryBookingAPIDetails
open InterCityBookingAPIDetails
open OneWayBookingAPIDetails
open OneWaySpecialZoneBookingAPIDetails
open RentalBookingAPIDetails
open Utils

@genType
type bookingAPIDetails =
  | ONE_WAY(oneWayBookingAPIDetails)
  | RENTAL(rentalBookingAPIDetails)
  | DRIVER_OFFER(oneWayBookingAPIDetails)
  | OneWaySpecialZoneAPIDetails(oneWaySpecialZoneBookingAPIDetails)
  | INTER_CITY(interCityBookingAPIDetails)
  | AMBULANCE(ambulanceBookingAPIDetails)
  | DELIVERY(deliveryBookingAPIDetails)

let decodeBookingAPIDetails = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          switch getOptionString(dict, "fareProductType") {
          | Some("ONE_WAY") =>
            dict
            ->Dict.get("contents")
            ->Option.getExn(~message="contents is not found")
            ->decodeOneWayBookingAPIDetails
            ->Result.map(x => ONE_WAY(x))
            ->Utils.getResultExn(~message="contents is coming as undefined")
          | Some("RENTAL") =>
            dict
            ->Dict.get("contents")
            ->Option.getExn(~message="contents is not found")
            ->decodeRentalBookingAPIDetails
            ->Result.map(x => RENTAL(x))
            ->Utils.getResultExn(~message="contents is coming as undefined")
          | Some("DRIVER_OFFER") =>
            dict
            ->Dict.get("contents")
            ->Option.getExn(~message="contents is not found")
            ->decodeOneWayBookingAPIDetails
            ->Result.map(x => DRIVER_OFFER(x))
            ->Utils.getResultExn(~message="contents is coming as undefined")
          | Some("OneWaySpecialZoneAPIDetails") =>
            dict
            ->Dict.get("contents")
            ->Option.getExn(~message="contents is not found")
            ->decodeOneWaySpecialZoneBookingAPIDetails
            ->Result.map(x => OneWaySpecialZoneAPIDetails(x))
            ->Utils.getResultExn(~message="contents is coming as undefined")
          | Some("INTER_CITY") =>
            dict
            ->Dict.get("contents")
            ->Option.getExn(~message="contents is not found")
            ->decodeInterCityBookingAPIDetails
            ->Result.map(x => INTER_CITY(x))
            ->Utils.getResultExn(~message="contents is coming as undefined")
          | Some("AMBULANCE") =>
            dict
            ->Dict.get("contents")
            ->Option.getExn(~message="contents is not found")
            ->decodeAmbulanceBookingAPIDetails
            ->Result.map(x => AMBULANCE(x))
            ->Utils.getResultExn(~message="contents is coming as undefined")
          | Some("DELIVERY") =>
            dict
            ->Dict.get("contents")
            ->Option.getExn(~message="contents is not found")
            ->decodeDeliveryBookingAPIDetails
            ->Result.map(x => DELIVERY(x))
            ->Utils.getResultExn(~message="contents is coming as undefined")
          | _ => Js.Exn.raiseError("Invalid fareProductType value")
          }
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("BookingAPIDetails ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: bookingAPIDetails) => {
  req->asJson
}
