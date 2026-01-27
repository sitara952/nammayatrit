open Enums
open Utils

@genType
type translationItem = {
  language: Language.language,
  translation: string,
}

@genType
type badgeItem = {
  key: string,
  translations: array<translationItem>,
}

@genType
type feedbackFormItem = {
  badges: array<badgeItem>,
  question: string,
  questionId: string,
  questionTranslations: array<translationItem>,
}

let decodeTranslationItem = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          language: Language.decodeLanguageResult(dict, "language")->Utils.getResultExn(
            ~message="language is coming as undefined",
          ),
          translation: getOptionString(dict, "translation")->Option.getExn(
            ~message="translation not found",
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("TranslationItem ERROR", err)
      Error(err)
    }
  }
}

let decodeBadgeItem = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          key: getOptionString(dict, "key")->Option.getExn(~message="key not found"),
          translations: dict
          ->Dict.get("translations")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.getExn(~message="translations is not of array")
          ->Array.map(x =>
            decodeTranslationItem(x)->Utils.getResultExn(~message="translation item error")
          ),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("BadgeItem ERROR", err)
      Error(err)
    }
  }
}

let decodeFeedbackFormItem = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          badges: dict
          ->Dict.get("badges")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.map(arr => 
            arr->Array.map(x => decodeBadgeItem(x)->Utils.getResultExn(~message="badge item error"))
          )
          ->Option.getOr([]),
          question: getOptionString(dict, "question")->Option.getExn(~message="question not found"),
          questionId: getOptionString(dict, "questionId")->Option.getExn(
            ~message="questionId not found",
          ),
          questionTranslations: dict
          ->Dict.get("questionTranslations")
          ->Option.flatMap(x => Js.Json.decodeArray(x))
          ->Option.map(arr =>
            arr->Array.map(x =>
              decodeTranslationItem(x)->Utils.getResultExn(~message="question translation error")
            )
          )
          ->Option.getOr([]),
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("FeedbackFormItem ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: feedbackFormItem) => {
  req->asJson
}
