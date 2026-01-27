open Enums
open PersonDetails
open Utils

@genType
type deliveryDetails = {
  initiatedAs: DeliveryParties.deliveryParties,
  receiverDetails: personDetails,
  senderDetails: personDetails,
}

let decodeDeliveryDetails = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          initiatedAs: DeliveryParties.decodeDeliveryPartiesResult(
            dict,
            "initiatedAs",
          )->Utils.getResultExn(~message="initiatedAs is coming as undefined"),
          receiverDetails: dict
          ->Dict.get("receiverDetails")
          ->Option.getExn(~message="receiverDetails is not found")
          ->decodePersonDetails
          ->Utils.getResultExn(~message="receiverDetails is coming as undefined"),
          senderDetails: dict
          ->Dict.get("senderDetails")
          ->Option.getExn(~message="senderDetails is not found")
          ->decodePersonDetails
          ->Utils.getResultExn(~message="senderDetails is coming as undefined"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("DeliveryDetails ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: deliveryDetails) => {
  req->asJson
}
