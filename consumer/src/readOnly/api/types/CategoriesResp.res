open PeopleCategoriesResp
open Utils

@genType
type categoriesResp = {
  allowedSeats: option<int>,
  availableSeats: option<int>,
  bookedSeats: int,
  id: string,
  inclusionPoints: option<array<string>>,
  isClosed: bool,
  maxSelection: option<int>,
  name: string,
  peopleCategories: array<peopleCategoriesResp>,
}

let decodeCategoriesResp = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          allowedSeats: getOptionInt(dict, "allowedSeats"),
          availableSeats: getOptionInt(dict, "availableSeats"),
          bookedSeats: getOptionInt(dict, "bookedSeats")->Option.getExn(
            ~message="bookedSeats not found",
          ),
          id: getOptionString(dict, "id")->Option.getExn(~message="id not found"),
          inclusionPoints: getOptionStrArrayFromDict(dict, "inclusionPoints"),
          isClosed: getOptionBool(dict, "isClosed")->Option.getExn(~message="isClosed not found"),
          maxSelection: getOptionInt(dict, "maxSelection"),
          name: getOptionString(dict, "name")->Option.getExn(~message="name not found"),
          peopleCategories: dict
          ->Dict.get("peopleCategories")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="peopleCategories is not of array")
          ->Array.map(x =>
            decodePeopleCategoriesResp(x)->Utils.getResultExn(
              ~message="peopleCategories is coming as undefined",
            )
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("CategoriesResp ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: categoriesResp) => {
  req->asJson
}
