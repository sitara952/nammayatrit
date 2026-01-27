open CancellationCharge
open PriceAPIEntity
open Utils

@genType
type ticketBookingPeopleCategoryDetails = {
  amountToRefund: option<float>,
  cancelCharges: option<array<cancellationCharge>>,
  id: string,
  name: string,
  numberOfUnits: int,
  numberOfUnitsCancelled: option<int>,
  pricePerUnit: float,
  pricePerUnitWithCurrency: priceAPIEntity,
}

let decodeTicketBookingPeopleCategoryDetails = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          amountToRefund: getOptionFloat(dict, "amountToRefund"),
          cancelCharges: dict
          ->Dict.get("cancelCharges")
          ->Option.flatMap(jsonNullToOption)
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.map(arr =>
            arr->Array.map(x =>
              decodeCancellationCharge(x)->Utils.getResultExn(
                ~message="cancelCharges is coming as undefined",
              )
            )
          ),
          id: getOptionString(dict, "id")->Option.getExn(~message="id not found"),
          name: getOptionString(dict, "name")->Option.getExn(~message="name not found"),
          numberOfUnits: getOptionInt(dict, "numberOfUnits")->Option.getExn(
            ~message="numberOfUnits not found",
          ),
          numberOfUnitsCancelled: getOptionInt(dict, "numberOfUnitsCancelled"),
          pricePerUnit: getOptionFloat(dict, "pricePerUnit")->Option.getExn(
            ~message="pricePerUnit not found",
          ),
          pricePerUnitWithCurrency: dict
          ->Dict.get("pricePerUnitWithCurrency")
          ->Option.getExn(~message="pricePerUnitWithCurrency is not found")
          ->decodePriceAPIEntity
          ->Utils.getResultExn(~message="pricePerUnitWithCurrency is coming as undefined"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("TicketBookingPeopleCategoryDetails ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: ticketBookingPeopleCategoryDetails) => {
  req->asJson
}
