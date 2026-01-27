open SuggestionPrediction
open! SuggestionDefinition

let getMessageFromKey = (key: string, lang: string): string => {
  Console.log2("key: ", key)
  let (rideFlowState, _) = React.useContext(RideFlowContext.context)
  let message =
    rideFlowState.suggestionsDefinition
    ->Option.getOr(getSuggestionsDefinition)
    ->Array.find(suggestion => suggestion.key == key)
    ->Belt.Option.getWithDefault({
      key: "",
      value: {en_us: key, ta_in: key, kn_in: key, hi_in: key, ml_in: key, bn_in: key, te_in: key},
    })
  switch lang {
  | "en_us" => message.value.en_us
  | "ta_in" => message.value.ta_in
  | "kn_in" => message.value.kn_in
  | "hi_in" => message.value.hi_in
  | "ml_in" => message.value.ml_in
  | "bn_in" => message.value.bn_in
  | "te_in" => message.value.te_in
  | _ => message.value.en_us
  }
}

let getMessages = (message: string): string => {
  let message = getMessageFromKey(message, "en_us")
  message
}

let getSuggestionsFromKey = (key: string) => {
  let (rideFlowState, _) = React.useContext(RideFlowContext.context)
  let suggestionArr =
    rideFlowState.suggestionsPrediction
    ->Option.getOr(getSuggestions)
    ->Array.filter(suggestion => suggestion.key == key)
    ->Array.map(suggestion => suggestion.value)
  Console.log2("suggestionArr: ", suggestionArr)
  let suggestions = suggestionArr[0]
  Console.log2("suggestions ", suggestions)
  suggestions
}

let getMessagesForKeys = (keys: array<string>): array<string> => {
  let messages = keys->Array.map(key => getMessageFromKey(key, "en_us"))
  messages
}

let getMessagesWithKeysObj = (keys: array<string>): array<suggestionRecord> => {
  let messages = keys->Array.map(key => {
    let message = getMessageFromKey(key, "en_us")
    {message, key}
  })
  messages
}
