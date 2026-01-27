open DriverOfferAPIEntity
open InterCityDetailsAPIEntity
open OneWayQuoteAPIDetails
open RentalDetailsAPIEntity
open SpecialZoneQuoteAPIEntity
open Utils

@genType
type quoteAPIDetails =
  | ONE_WAY(oneWayQuoteAPIDetails)
  | AMBULANCE(driverOfferAPIEntity)
  | INTER_CITY(interCityDetailsAPIEntity)
  | RENTAL(rentalDetailsAPIEntity)
  | DRIVER_OFFER(driverOfferAPIEntity)
  | OneWaySpecialZoneAPIDetails(specialZoneQuoteAPIEntity)
  | DELIVERY(driverOfferAPIEntity)

let decodeQuoteAPIDetails = data => {
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
            ->decodeOneWayQuoteAPIDetails
            ->Result.map(x => ONE_WAY(x))
            ->Utils.getResultExn(~message="contents is coming as undefined")
          | Some("AMBULANCE") =>
            dict
            ->Dict.get("contents")
            ->Option.getExn(~message="contents is not found")
            ->decodeDriverOfferAPIEntity
            ->Result.map(x => AMBULANCE(x))
            ->Utils.getResultExn(~message="contents is coming as undefined")
          | Some("INTER_CITY") =>
            dict
            ->Dict.get("contents")
            ->Option.getExn(~message="contents is not found")
            ->decodeInterCityDetailsAPIEntity
            ->Result.map(x => INTER_CITY(x))
            ->Utils.getResultExn(~message="contents is coming as undefined")
          | Some("RENTAL") =>
            dict
            ->Dict.get("contents")
            ->Option.getExn(~message="contents is not found")
            ->decodeRentalDetailsAPIEntity
            ->Result.map(x => RENTAL(x))
            ->Utils.getResultExn(~message="contents is coming as undefined")
          | Some("DRIVER_OFFER") =>
            dict
            ->Dict.get("contents")
            ->Option.getExn(~message="contents is not found")
            ->decodeDriverOfferAPIEntity
            ->Result.map(x => DRIVER_OFFER(x))
            ->Utils.getResultExn(~message="contents is coming as undefined")
          | Some("OneWaySpecialZoneAPIDetails") =>
            dict
            ->Dict.get("contents")
            ->Option.getExn(~message="contents is not found")
            ->decodeSpecialZoneQuoteAPIEntity
            ->Result.map(x => OneWaySpecialZoneAPIDetails(x))
            ->Utils.getResultExn(~message="contents is coming as undefined")
          | Some("DELIVERY") =>
            dict
            ->Dict.get("contents")
            ->Option.getExn(~message="contents is not found")
            ->decodeDriverOfferAPIEntity
            ->Result.map(x => DELIVERY(x))
            ->Utils.getResultExn(~message="contents is coming as undefined")
          | _ => Js.Exn.raiseError("Invalid fareProductType value")
          }
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("QuoteAPIDetails ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: quoteAPIDetails) => {
  req->asJson
}
