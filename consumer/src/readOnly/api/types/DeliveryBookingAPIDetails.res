open Enums
open DeliveryPersonDetailsAPIEntity
open Distance
open LocationAPIEntity
open Utils

@genType
type deliveryBookingAPIDetails = {
  estimatedDistance: float,
  estimatedDistanceWithUnit: distance,
  receiverDetails: deliveryPersonDetailsAPIEntity,
  requestorPartyRoles: array<PartyRole.partyRole>,
  senderDetails: deliveryPersonDetailsAPIEntity,
  toLocation: locationAPIEntity,
}

let decodeDeliveryBookingAPIDetails = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          estimatedDistance: getOptionFloat(dict, "estimatedDistance")->Option.getExn(
            ~message="estimatedDistance not found",
          ),
          estimatedDistanceWithUnit: dict
          ->Dict.get("estimatedDistanceWithUnit")
          ->Option.getExn(~message="estimatedDistanceWithUnit is not found")
          ->decodeDistance
          ->Utils.getResultExn(~message="estimatedDistanceWithUnit is coming as undefined"),
          receiverDetails: dict
          ->Dict.get("receiverDetails")
          ->Option.getExn(~message="receiverDetails is not found")
          ->decodeDeliveryPersonDetailsAPIEntity
          ->Utils.getResultExn(~message="receiverDetails is coming as undefined"),
          requestorPartyRoles: dict
          ->Dict.get("requestorPartyRoles")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="requestorPartyRoles not found")
          ->Array.map(x =>
            PartyRole.decodePartyRole(x)->Utils.getResultExn(
              ~message="requestorPartyRoles is coming as undefined",
            )
          ),
          senderDetails: dict
          ->Dict.get("senderDetails")
          ->Option.getExn(~message="senderDetails is not found")
          ->decodeDeliveryPersonDetailsAPIEntity
          ->Utils.getResultExn(~message="senderDetails is coming as undefined"),
          toLocation: dict
          ->Dict.get("toLocation")
          ->Option.getExn(~message="toLocation is not found")
          ->decodeLocationAPIEntity
          ->Utils.getResultExn(~message="toLocation is coming as undefined"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("DeliveryBookingAPIDetails ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: deliveryBookingAPIDetails) => {
  req->asJson
}
