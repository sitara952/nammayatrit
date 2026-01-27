open Enums
open CardType
open WalletType
open Utils

@genType
type paymentInstrument = Card(cardType) | Wallet(walletType) | UPI | NetBanking | Cash

let decodePaymentInstrument = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          switch getOptionString(dict, "instrumentType") {
          | Some("Card") =>
            dict
            ->Dict.get("instrumentName")
            ->Option.getExn(~message="instrumentName is not found")
            ->decodeCardType
            ->Result.map(x => Card(x))
            ->Utils.getResultExn(~message="instrumentName is coming as undefined")
          | Some("Wallet") =>
            dict
            ->Dict.get("instrumentName")
            ->Option.getExn(~message="instrumentName is not found")
            ->decodeWalletType
            ->Result.map(x => Wallet(x))
            ->Utils.getResultExn(~message="instrumentName is coming as undefined")
          | Some("UPI") => UPI
          | Some("NetBanking") => NetBanking
          | Some("Cash") => Cash
          | _ => Js.Exn.raiseError("Invalid instrumentType value")
          }
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("PaymentInstrument ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: paymentInstrument) => {
  req->asJson
}
