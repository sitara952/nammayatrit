open Enums
open AutocompleteRes
open Utils

let frfsAutocompleteGetApiCall = async (
  input: option<string>,
  city: FrfsAutocompleteCity.frfsAutocompleteCity,
  location: string,
  vehicleType: FrfsAutocompleteVehicleType.frfsAutocompleteVehicleType,
) => {
  let data = await ApiCall.callGetAPI'(
    ~url="/frfs/autocomplete" ++
    ("?" ++
    Option.mapOr(input, "", x => "&input=" ++ x) ++
    "&city=" ++
    city->FrfsAutocompleteCity.frfsAutocompleteCityToString ++
    "&location=" ++
    location ++
    "&vehicleType=" ++
    vehicleType->FrfsAutocompleteVehicleType.frfsAutocompleteVehicleTypeToString),
  )
  AutocompleteRes.decodeAutocompleteRes(data)
}
