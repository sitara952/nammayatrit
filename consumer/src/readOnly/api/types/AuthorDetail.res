open Utils

@genType
type authorDetail = {
  authorId: string,
  firstName: option<string>,
  lastName: option<string>,
}

let decodeAuthorDetail = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          authorId: getOptionString(dict, "authorId")->Option.getExn(~message="authorId not found"),
          firstName: getOptionString(dict, "firstName"),
          lastName: getOptionString(dict, "lastName"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("AuthorDetail ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: authorDetail) => {
  req->asJson
}
