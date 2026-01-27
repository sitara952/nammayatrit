open MetroOffer
open PublicTransportQuote
open QuoteAPIEntity
open Utils

@genType
type offerRes =
  | OnDemandCab(quoteAPIEntity)
  | OnRentalCab(quoteAPIEntity)
  | Metro(metroOffer)
  | PublicTransport(publicTransportQuote)

let decodeOfferRes = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          let str = indexOfKeyPresentAmong(
            dict,
            ["onDemandCab", "onRentalCab", "metro", "publicTransport"],
          )
          switch str {
          | Some(0) =>
            dict
            ->Dict.get("onDemandCab")
            ->Option.getExn(~message="onDemandCab is not found")
            ->decodeQuoteAPIEntity
            ->Result.map(x => OnDemandCab(x))
            ->Utils.getResultExn(~message="onDemandCab is coming as undefined")
          | Some(1) =>
            dict
            ->Dict.get("onRentalCab")
            ->Option.getExn(~message="onRentalCab is not found")
            ->decodeQuoteAPIEntity
            ->Result.map(x => OnRentalCab(x))
            ->Utils.getResultExn(~message="onRentalCab is coming as undefined")
          | Some(2) =>
            dict
            ->Dict.get("metro")
            ->Option.getExn(~message="metro is not found")
            ->decodeMetroOffer
            ->Result.map(x => Metro(x))
            ->Utils.getResultExn(~message="metro is coming as undefined")
          | Some(3) =>
            dict
            ->Dict.get("publicTransport")
            ->Option.getExn(~message="publicTransport is not found")
            ->decodePublicTransportQuote
            ->Result.map(x => PublicTransport(x))
            ->Utils.getResultExn(~message="publicTransport is coming as undefined")
          | _ => Js.Exn.raiseError("Invalid value")
          }
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("OfferRes ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: offerRes) => {
  req->asJson
}
