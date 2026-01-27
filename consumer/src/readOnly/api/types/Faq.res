open Utils

@genType
type faq = {
  answer: string,
  question: string,
}

let decodeFaq = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          answer: getOptionString(dict, "answer")->Option.getExn(~message="answer not found"),
          question: getOptionString(dict, "question")->Option.getExn(~message="question not found"),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("Faq ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: faq) => {
  req->asJson
}
