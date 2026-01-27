open InterCitySearchReq
open OneWaySearchReq
open PublicTransportSearchReq
open RentalSearchReq
open Utils

@genType
type searchReq =
  | ONE_WAY(oneWaySearchReq)
  | RENTAL(rentalSearchReq)
  | INTER_CITY(interCitySearchReq)
  | AMBULANCE(oneWaySearchReq)
  | DELIVERY(oneWaySearchReq)
  | PTSearch(publicTransportSearchReq)

let decodeSearchReq = data => {
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
            ->decodeOneWaySearchReq
            ->Result.map(x => ONE_WAY(x))
            ->Utils.getResultExn(~message="contents is coming as undefined")
          | Some("RENTAL") =>
            dict
            ->Dict.get("contents")
            ->Option.getExn(~message="contents is not found")
            ->decodeRentalSearchReq
            ->Result.map(x => RENTAL(x))
            ->Utils.getResultExn(~message="contents is coming as undefined")
          | Some("INTER_CITY") =>
            dict
            ->Dict.get("contents")
            ->Option.getExn(~message="contents is not found")
            ->decodeInterCitySearchReq
            ->Result.map(x => INTER_CITY(x))
            ->Utils.getResultExn(~message="contents is coming as undefined")
          | Some("AMBULANCE") =>
            dict
            ->Dict.get("contents")
            ->Option.getExn(~message="contents is not found")
            ->decodeOneWaySearchReq
            ->Result.map(x => AMBULANCE(x))
            ->Utils.getResultExn(~message="contents is coming as undefined")
          | Some("DELIVERY") =>
            dict
            ->Dict.get("contents")
            ->Option.getExn(~message="contents is not found")
            ->decodeOneWaySearchReq
            ->Result.map(x => DELIVERY(x))
            ->Utils.getResultExn(~message="contents is coming as undefined")
          | Some("PTSearch") =>
            dict
            ->Dict.get("contents")
            ->Option.getExn(~message="contents is not found")
            ->decodePublicTransportSearchReq
            ->Result.map(x => PTSearch(x))
            ->Utils.getResultExn(~message="contents is coming as undefined")
          | _ => Js.Exn.raiseError("Invalid fareProductType value")
          }
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("SearchReq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: searchReq) => {
  req->asJson
}
