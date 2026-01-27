open CancellationCharge
open PriceAPIEntity
open Utils

@genType
type peopleCategoriesResp = {
  cancellationCharges: option<array<cancellationCharge>>,
  description: string,
  iconUrl: option<string>,
  id: string,
  name: string,
  pricePerUnit: float,
  pricePerUnitWithCurrency: priceAPIEntity,
}

let decodePeopleCategoriesResp = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          cancellationCharges: dict
          ->Dict.get("cancellationCharges")
          ->Option.flatMap(jsonNullToOption)
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.map(arr =>
            arr->Array.map(x =>
              decodeCancellationCharge(x)->Utils.getResultExn(
                ~message="cancellationCharges is coming as undefined",
              )
            )
          ),
          description: getOptionString(dict, "description")->Option.getExn(
            ~message="description not found",
          ),
          iconUrl: getOptionString(dict, "iconUrl"),
          id: getOptionString(dict, "id")->Option.getExn(~message="id not found"),
          name: getOptionString(dict, "name")->Option.getExn(~message="name not found"),
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
      Console.log2("PeopleCategoriesResp ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: peopleCategoriesResp) => {
  req->asJson
}
