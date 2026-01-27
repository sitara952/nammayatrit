open Utils

// Utility function to strip HTML tags and return clean text
let stripHtmlTags = (htmlString: string) => {
  htmlString
  // Remove HTML tags using regex
  ->Js.String2.replaceByRe(%re("/<[^>]*>/g"), "")
  // Replace HTML entities
  ->Js.String2.replaceByRe(%re("/&nbsp;/g"), " ")
  ->Js.String2.replaceByRe(%re("/&lt;/g"), "<")
  ->Js.String2.replaceByRe(%re("/&gt;/g"), ">")
  ->Js.String2.replaceByRe(%re("/&amp;/g"), "&")
  ->Js.String2.replaceByRe(%re("/&quot;/g"), "\"")
  ->Js.String2.replaceByRe(%re("/&#39;/g"), "'")
  // Normalize whitespace
  ->Js.String2.replaceByRe(%re("/\s+/g"), " ")
  ->Js.String2.trim
}

@genType
type taggedChatMessageContentTextMessage = {contents: option<string>}

let decodeTaggedChatMessageContentTextMessage = data => {
  try {
    Ok(
      data
      ->JSON.Decode.object
      ->Option.getOr(Dict.make())
      ->(
        dict => {
          contents: switch getOptionString(dict, "contents") {
          | Some(rawContent) => Some(stripHtmlTags(rawContent))
          | None => None
          },
        }
      ),
    )
  } catch {
  | err => {
      Console.log2("TaggedChatMessageContentTextMessage ERROR", err)
      Error(err)
    }
  }
}

let toJson = (req: taggedChatMessageContentTextMessage) => {
  req->asJson
}
