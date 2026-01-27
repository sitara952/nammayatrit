// open LatLong
open DayJs

external asJson: _ => JSON.t = "%identity"

let getOptionFloat = (dict, key) => {
  dict->Dict.get(key)->Option.flatMap(JSON.Decode.float)
}
let getFloat = (dict, key, default) => {
  getOptionFloat(dict, key)->Option.getOr(default)
}
let _ = getFloat
// parse a string into json and return optional json
let safeParseOpt = st => {
  try {
    JSON.parseExn(st)->Some
  } catch {
  | _e => None
  }
}
// parse a string into json and return json with null default
let safeParse = st => {
  safeParseOpt(st)->Option.getOr(JSON.Encode.null)
}

let getDictFromJsonObject = json => {
  switch json->JSON.Decode.object {
  | Some(dict) => dict
  | None => Dict.make()
  }
}

let removeDuplicate = (arr: array<string>) => {
  arr->Array.filterWithIndex((item, i) => {
    arr->Array.indexOf(item) === i
  })
}

let sortBasedOnPriority = (sortArr: array<string>, priorityArr: array<string>) => {
  let finalPriorityArr = priorityArr->Array.filter(val => sortArr->Array.includes(val))
  let filteredArr = sortArr->Array.filter(item => !(finalPriorityArr->Array.includes(item)))
  finalPriorityArr->Array.concat(filteredArr)
}

let toCamelCase = str => {
  let strArr = str->String.replaceRegExp(%re("/[-_]+/g"), " ")->String.split(" ")
  strArr
  ->Array.mapWithIndex((item, i) => {
    let matchFn = (~match, ~group1, ~group2, ~group3, ~offset, ~input) => {
      ignore(group1)
      ignore(group2)
      ignore(group3)
      ignore(offset)
      ignore(input)
      if i == 0 {
        match->String.toLocaleLowerCase
      } else {
        match->String.toLocaleUpperCase
      }
    }
    item->String.unsafeReplaceRegExpBy3(%re("/(?:^\w|[A-Z]|\b\w)/g"), matchFn)
  })
  ->Array.join("")
}

let getNameFromEmail = email => {
  email
  ->String.split("@")
  ->Array.getUnsafe(0)
  ->String.split(".")
  ->Array.map(name => {
    if name == "" {
      name
    } else {
      name->String.getUnsafe(0)->String.toUpperCase ++ name->String.sliceToEnd(~start=1)
    }
  })
  ->Array.join(" ")
}

let validateEmail = str => {
  !Js.Re.test_(
    %re(`/^[a-zA-Z0-9]+([._-]?[a-zA-Z0-9]+)*(\+[a-zA-Z0-9]+)?@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/`),
    str->String.trim,
  )
}

let emailIsExternal: string => bool = email => {
  !(email->String.includes("@nammayatri"))
}

let doSetState = (value, setter) => {
  setter(_ => value)
}

let getOptionString = (dict, key) => {
  dict->Dict.get(key)->Option.flatMap(JSON.Decode.string)
}

let getOptionalJsonAsString = (dict, key) => {
  dict
  ->Dict.get(key)
  ->Option.flatMap(json =>
    switch Js.Json.decodeNull(json) {
    | Some(_) => None
    | None => Some(JSON.stringify(json))
    }
  )
}

let getOptionStrArray = (dict, key) => {
  dict
  ->Dict.get(key)
  ->Option.flatMap(JSON.Decode.array)
  ->Option.map(arr => arr->Array.filterMap(JSON.Decode.string))
}

let getString = (dict, key, default) => {
  getOptionString(dict, key)->Option.getOr(default)
}

let getStrVal = (~default="", dict, key) => {
  getOptionString(dict, key)->Option.getOr(default)
}

let getStringFromJson = (json: JSON.t, default) => {
  json->JSON.Decode.string->Option.getOr(default)
}

let getBoolFromJson = (json, defaultValue) => {
  json->JSON.Decode.bool->Option.getOr(defaultValue)
}

let getArrayFromJson = (json: JSON.t, default) => {
  json->JSON.Decode.array->Option.getOr(default)
}

let getOptionalArrayFromDict = (dict, key) => {
  dict->Dict.get(key)->Option.flatMap(JSON.Decode.array)
}

let getArrayFromDict = (dict, key, default) => {
  dict->getOptionalArrayFromDict(key)->Option.getOr(default)
}

let getArrayDataFromJson = (json, itemToObjMapper) => {
  json
  ->JSON.Decode.array
  ->Option.getOr([])
  ->Array.filterMap(JSON.Decode.object)
  ->Array.map(itemToObjMapper)
}
let getStrArray = (dict, key) => {
  dict->getOptionalArrayFromDict(key)->Option.getOr([])->Array.filterMap(JSON.Decode.string)
}
let getBoolArray = (dict, key) => {
  dict->getOptionalArrayFromDict(key)->Option.getOr([])->Array.filterMap(JSON.Decode.bool)
}

let getStrArrayFromJsonArray = jsonArr => {
  jsonArr->Array.filterMap(JSON.Decode.string)
}
let getIntArrayFromJsonArray = jsonArr => {
  jsonArr->Array.filterMap(JSON.Decode.float)->Array.map(num => num->Float.toInt)
}

let getFloatArrayFromJsonArray = jsonArr => {
  jsonArr->Array.filterMap(JSON.Decode.float)
}

let getStrArryFromJson = arr => {
  arr->JSON.Decode.array->Option.map(getStrArrayFromJsonArray)->Option.getOr([])
}

let getOptionStrArrayFromJson = json => {
  json->JSON.Decode.array->Option.map(getStrArrayFromJsonArray)
}

let getOptionIntArrayFromJson = json => {
  json->JSON.Decode.array->Option.map(getIntArrayFromJsonArray)
}

let getOptionFloatArrayFromJson = json => {
  json->JSON.Decode.array->Option.map(getFloatArrayFromJsonArray)
}

let getOptionStrArrayFromDict = (dict, key) => {
  dict->Dict.get(key)->Option.flatMap(getOptionStrArrayFromJson)
}

let getOptionIntArrayFromDict = (dict, key) => {
  dict->Dict.get(key)->Option.flatMap(getOptionIntArrayFromJson)
}

let getOptionFloatArrayFromDict = (dict, key) => {
  dict->Dict.get(key)->Option.flatMap(getOptionFloatArrayFromJson)
}

let getNonEmptyString = str => {
  if str === "" {
    None
  } else {
    Some(str)
  }
}

let getNonEmptyArray = arr => {
  if arr->Array.length === 0 {
    None
  } else {
    Some(arr)
  }
}

let getReturnArray = (dict, key) => {
  switch Dict.get(dict, key) {
  | Some(value) =>
    switch value->JSON.Decode.array {
    | Some(jsonArr) =>
      jsonArr
      ->Array.reduce([], (acc, jsonItem) => {
        switch jsonItem->JSON.Decode.array {
        | Some(percentTuple) =>
          if percentTuple->Array.length === 2 {
            let percent = switch JSON.Decode.float(
              percentTuple[0]->Option.getOr(JSON.Encode.null),
            ) {
            | Some(num) => num->Float.toInt
            | None => 0
            }

            let priorityArr = switch percentTuple[1]
            ->Option.getOr(JSON.Encode.null)
            ->getOptionStrArrayFromJson {
            | Some(x) => x
            | None => []
            }

            acc->Array.push((percent, priorityArr))
          }
        | None => ()
        }
        acc
      })
      ->Some
    | None => None
    }
  | None => None
  }
}

let getOptionBool = (dict, key) => {
  dict->Dict.get(key)->Option.flatMap(JSON.Decode.bool)
}

let getBool = (dict, key, default) => {
  getOptionBool(dict, key)->Option.getOr(default)
}

let getJsonObjectFromDict = (dict, key) => {
  dict->Dict.get(key)->Option.getOr(JSON.Encode.object(Dict.make()))
}

let getOptionalJsonObjectFromDict = (dict, key) => {
  dict->Dict.get(key)
}

let getJsonFromDict = (dict, key) => {
  dict->Dict.get(key)->Option.getOr("NA"->JSON.Encode.string)
}

let getBoolFromString = (boolString, default: bool) => {
  switch boolString->String.toLowerCase {
  | "true" => true
  | "false" => false
  | _ => default
  }
}

let getIntFromString = (str, default) => {
  switch str->Int.fromString {
  | Some(int) => int
  | None => default
  }
}

let getOptionFloatFromString = str => {
  str->Float.fromString
}

let getFloatFromString = (str, default) => {
  switch str->Float.fromString {
  | Some(floatVal) => floatVal
  | None => default
  }
}

let getFloatFromOptionString = (str: option<string>, default) => {
  str->Option.getOr("")->Float.fromString->Option.getOr(default)
}

let getOptionIntFromString = str => {
  str->Int.fromString
}

let getIntFromJson = (json, default) => {
  switch json->JSON.Classify.classify {
  | String(str) => getIntFromString(str, default)
  | Number(floatValue) => floatValue->Float.toInt
  | _ => default
  }
}
let getOptionIntFromJson = json => {
  switch json->JSON.Classify.classify {
  | String(str) => getOptionIntFromString(str)
  | Number(floatValue) => Some(floatValue->Float.toInt)
  | _ => None
  }
}
let getOptionFloatFromJson = json => {
  switch json->JSON.Classify.classify {
  | String(str) => getOptionFloatFromString(str)
  | Number(floatValue) => Some(floatValue)
  | _ => None
  }
}

let getFloatFromJson = (json, default) => {
  switch json->JSON.Classify.classify {
  | String(str) => getFloatFromString(str, default)
  | Number(floatValue) => floatValue
  | _ => default
  }
}

let getInt = (dict, key, default) => {
  switch Dict.get(dict, key) {
  | Some(value) => getIntFromJson(value, default)
  | None => default
  }
}
let getOptionInt = (dict, key) => {
  switch Dict.get(dict, key) {
  | Some(value) => getOptionIntFromJson(value)
  | None => None
  }
}

let getOptionFloat = (dict, key) => {
  switch Dict.get(dict, key) {
  | Some(value) => getOptionFloatFromJson(value)
  | None => None
  }
}

let getStringFromBool = boolValue => {
  switch boolValue {
  | true => "true"
  | false => "false"
  }
}

let rec getStringFromJsonForJoinWith = jsonVal => {
  switch jsonVal->JSON.Classify.classify {
  | String(str) => str
  | Number(num) => num->Float.toString
  | Bool(boolVal) => boolVal->getStringFromBool
  | Array(arr) => arr->Array.map(item => item->getStringFromJsonForJoinWith)->Array.join(",")
  | Null => ""
  | Object(_) => "[object Object]"
  }
}

let getStrArrayFromJsonArray = arrJson => arrJson->Array.map(getStringFromJsonForJoinWith)

let getOptionStrArrayFromJson = json => {
  json->JSON.Decode.array->Option.map(getStrArrayFromJsonArray)
}

let getStrArrayFromDict = (dict, key, default) => {
  dict->Dict.get(key)->Option.flatMap(getOptionStrArrayFromJson)->Option.getOr(default)
}

let getDictFromJson = dict => {
  dict->JSON.Decode.object->Option.getOr(Dict.make())
}
let getFloat = (dict, key, default) => {
  dict->Dict.get(key)->Option.map(json => getFloatFromJson(json, default))->Option.getOr(default)
}

let getObj = (dict, key, default) => {
  dict->Dict.get(key)->Option.flatMap(JSON.Decode.object)->Option.getOr(default)
}

let setOptionString = (dict, key, optionStr) =>
  optionStr->Option.mapOr((), str => dict->Dict.set(key, str->JSON.Encode.string))

let setOptionFloat = (dict, key, optionFloat) =>
  optionFloat->Option.mapOr((), float => dict->Dict.set(key, float->JSON.Encode.float))

let setOptionInt = (dict, key, optionInt) =>
  optionInt->Option.mapOr((), int => dict->Dict.set(key, int->Float.fromInt->JSON.Encode.float))

let setOptionBool = (dict, key, optionInt) =>
  optionInt->Option.mapOr((), bool => dict->Dict.set(key, bool->JSON.Encode.bool))

let setOptionArray = (dict, key, optionArray) =>
  optionArray->Option.mapOr((), array => dict->Dict.set(key, array->JSON.Encode.array))

let setOptionDict = (dict, key, optionDictValue) =>
  optionDictValue->Option.mapOr((), value => dict->Dict.set(key, value->JSON.Encode.object))

let getJsonFromStringOption = optionStr =>
  optionStr->Option.mapOr(JSON.Encode.null, str => str->JSON.Encode.string)

let getJsonFromFloatOption = optionFloat =>
  optionFloat->Option.mapOr(JSON.Encode.null, num => num->JSON.Encode.float)

let getJsonFromIntOption = optionInt =>
  optionInt->Option.mapOr(JSON.Encode.null, v => v->Float.fromInt->JSON.Encode.float)

let capitalizeString = str => {
  String.toUpperCase(String.charAt(str, 0)) ++ String.substringToEnd(str, ~start=1)
}

let snakeToCamel = str => {
  str
  ->String.split("_")
  ->Array.mapWithIndex((x, i) => i == 0 ? x : capitalizeString(x))
  ->Array.join("")
}
let snakeCaseToWords = str => {
  str->capitalizeString->String.replaceRegExp(%re("/([a-z0-9A-Z])([A-Z])/g"), "$1 $2")
}

let camelToSnake = str => {
  str
  ->capitalizeString
  ->String.replaceRegExp(%re("/([a-z0-9A-Z])([A-Z])/g"), "$1_$2")
  ->String.toLowerCase
}

let camelCaseToTitle = str => {
  str->capitalizeString->String.replaceRegExp(%re("/([a-z0-9A-Z])([A-Z])/g"), "$1 $2")
}

let isContainingStringLowercase = (text, searchStr) => {
  text->String.toLowerCase->String.includes(searchStr->String.toLowerCase)
}

let snakeToTitle = str => {
  str
  ->String.split("_")
  ->Array.map(x => {
    let first = x->String.charAt(0)->String.toUpperCase
    let second = x->String.substringToEnd(~start=1)
    first ++ second
  })
  ->Array.join(" ")
}

let keyToTitle = key => key->String.includes("_") ? key->snakeToTitle : key->camelCaseToTitle

let urlToTitle = str => {
  str
  ->String.split("-")
  ->Array.map(x => {
    let firstLetter = x->String.charAt(0)->String.toUpperCase
    let restLetters = x->String.substringToEnd(~start=1)
    `${firstLetter}${restLetters}`
  })
  ->Array.join(" ")
}

let titleToSnake = str => {
  str->String.split(" ")->Array.map(str => str->String.toLowerCase)->Array.join("_")
}

let wrapString = (str, charLimit) => {
  let length = str->String.length
  if length > charLimit {
    str->String.slice(~start=0, ~end=charLimit) ++ "..."
  } else {
    str
  }
}

let getOptionalDictFromDict = (dict, key) => {
  switch dict->Dict.get(key) {
  | Some(json) =>
    switch json->JSON.Decode.object {
    | Some(dict) => Some(dict)
    | None => None
    }
  | None => None
  }
}

let getIntFromString = (str, default) => {
  str->Int.fromString->Option.getOr(default)
}

let getIntFromOptionString = (optionStr, default) => {
  switch optionStr {
  | Some(str) => str->getIntFromString(default)
  | None => default
  }
}

let removeTrailingZero = (numeric_str: string) => {
  numeric_str->Float.fromString->Option.getOr(0.)->Float.toString
}

let latencyShortNum = (~labelValue: float, ~includeMilliseconds=?, ()) => {
  if labelValue !== 0.0 {
    let value = labelValue
    let value_days = value /. 86400.
    let years = (value_days /. 365.)->Float.toInt
    let months = (mod_float(value_days, 365.) /. 30.)->Float.toInt
    let days = mod_float(mod_float(value_days, 365.), 30.)->Float.toInt
    let hours = (value /. 3600.)->Float.toInt
    let minutes = (mod_float(value, 3600.) /. 60.)->Float.toInt
    let seconds = mod_float(mod_float(value, 3600.), 60.)->Float.toInt

    let year_disp = if years >= 1 {
      `${String.make(years)}Y `
    } else {
      ""
    }
    let month_disp = if months > 0 {
      `${String.make(months)}M `
    } else {
      ""
    }
    let day_disp = if days > 0 {
      `${String.make(days)}D `
    } else {
      ""
    }
    let hr_disp = if hours > 0 {
      `${String.make(hours)}H `
    } else {
      ""
    }
    let min_disp = if minutes > 0 {
      `${String.make(minutes)}M `
    } else {
      ""
    }

    let millisec_disp = if (
      (labelValue < 1.0 || (includeMilliseconds->Option.getOr(false) && labelValue < 60.0)) &&
        labelValue > 0.0
    ) {
      `.${String.make(mod((labelValue *. 1000.0)->Int.fromFloat, 1000))}`
    } else {
      ""
    }

    let sec_disp = if seconds > 0 {
      `${String.make(seconds)}${millisec_disp}S `
    } else {
      ""
    }

    if days > 0 {
      year_disp ++ month_disp ++ day_disp
    } else {
      year_disp ++ month_disp ++ day_disp ++ hr_disp ++ min_disp ++ sec_disp
    }
  } else {
    "0ms"
  }
}

let checkEmptyJson = json => {
  json == JSON.Encode.object(Dict.make())
}

let numericArraySortComperator = (a, b) => {
  if a < b {
    -1
  } else if a > b {
    1
  } else {
    0
  }
}

//agnostic of case
let alphabeticalSortFn = (e1, e2) => {
  let e1 = e1->String.toLowerCase
  let e2 = e2->String.toLowerCase
  if e1 > e2 {
    1
  } else if e1 < e2 {
    -1
  } else {
    0
  }
}

let makeURLFromHostnameQuery = (host, queryDict) => {
  let query = queryDict->Dict.toArray->Array.map(((k, v)) => `${k}=${v}`)->Array.join("&")
  `${host}?${query}`
}

let isEmptyDict = dict => {
  dict->Dict.keysToArray->Array.length === 0
}
let stringReplaceAll = (str, old, new) => {
  str->String.split(old)->Array.join(new)
}

let getNullFloat = (dict, key) => {
  switch Dict.get(dict, key) {
  | Some(value) =>
    switch value->JSON.Decode.string {
    | Some(val) => val->Float.fromString->Nullable.fromOption
    | None =>
      switch value->JSON.Decode.float {
      | Some(val) => val->Nullable.make
      | None => Nullable.null
      }
    }
  | None => Nullable.null
  }
}

let getUniqueArray = (arr: array<'t>) => {
  arr->Array.map(item => (item, ""))->Dict.fromArray->Dict.keysToArray
}

let getFirstLetterCaps = (str, ~splitBy="-", ()) => {
  str
  ->String.toLowerCase
  ->String.split(splitBy)
  ->Array.map(capitalizeString)
  ->Array.join(" ")
}

let getDictfromDict = (dict, key) => {
  dict->getJsonObjectFromDict(key)->getDictFromJsonObject
}

let getDictfromJsonString = (jsonString: string): option<Dict.t<JSON.t>> => {
  let json = JSON.parseExn(jsonString)
  JSON.Decode.object(json)
}

let checkLeapYear = year => (mod(year, 4) === 0 && mod(year, 100) !== 0) || mod(year, 400) === 0

let safeDivision = (~numerator: float, ~denominator: float) => {
  denominator > 0. ? numerator /. denominator : 0.
}

let safeDivisionInt = (~numerator: int, ~denominator: int) => {
  denominator > 0 ? numerator / denominator : 0
}

let getValueFromArr = (arr, index, default) => arr->Array.get(index)->Option.getOr(default)

let isEqualStringArr = (arr1, arr2) => {
  let arr1 = arr1->getUniqueArray
  let arr2 = arr2->getUniqueArray
  let lengthEqual = arr1->Array.length === arr2->Array.length
  let isContainsAll = arr1->Array.reduce(true, (acc, str) => {
    arr2->Array.includes(str) && acc
  })
  lengthEqual && isContainsAll
}

let removeDuplicatesFromArray = arr => {
  let tempArr = []
  arr->Array.forEach(item => {
    !(tempArr->Array.includes(item)) ? tempArr->Array.push(item)->ignore : ()
  })
  tempArr
}

let convertNewLineSaperatedDataToArrayOfJson = text => {
  try {
    text->String.split("\n")->Array.filterMap(item => item !== "" ? Some(item->safeParse) : None)
  } catch {
  | _ => []
  }
}

let getObjectArrayFromJson = json => {
  json->getArrayFromJson([])->Array.map(getDictFromJsonObject)
}

let getListHead = (~default="", list) => {
  list->List.head->Option.getOr(default)
}

let compareStr = (str1, str2) => {
  str1->String.toLowerCase->String.includes(str2->String.toLowerCase)
}

let getJsonDict = val => {
  val->Option.getOr(Dict.make()->JSON.Encode.object)
}

let compareLogic = (firstValue, secondValue) => {
  let (temp1, _) = firstValue
  let (temp2, _) = secondValue
  if temp1 == temp2 {
    0
  } else if temp1 > temp2 {
    -1
  } else {
    1
  }
}

let getJsonFromArrayOfJson = arr => arr->Dict.fromArray->JSON.Encode.object
let getNonEmptyStrFromOptionStr = (str, defaultValue) => {
  switch str {
  | Some(val) => val->String.trim !== "" ? val : defaultValue
  | None => defaultValue
  }
}

let rec monacoReader: (string, ~keyColor: string, ~valueColor: string) => React.element = (
  data,
  ~keyColor,
  ~valueColor,
) => {
  let dataArr = data->safeParse->getDictFromJsonObject->Dict.toArray
  let dataLength = Array.length(dataArr)

  dataArr
  ->Array.mapWithIndex((entry, idx) => {
    let (key, val) = entry

    switch val->JSON.Decode.object {
    | Some(_obj) =>
      <div
        key={idx->Int.toString} className="font-roboto-mono text-fs-code-14 font-medium leading-6">
        <div>
          <div className="flex flex-row gap-2">
            <div className=keyColor> {`\"${key}\"`->React.string} </div>
            <div> {`:`->React.string} </div>
            <div> {`{`->React.string} </div>
          </div>
          <div>
            <div className="ml-3">
              {monacoReader(val->JSON.stringify, ~keyColor, ~valueColor)}
            </div>
            <div> {"}"->React.string} </div>
          </div>
        </div>
      </div>
    | None =>
      <div
        key={idx->Int.toString}
        className="flex flex-row gap-2 text-fs-code-14 font-medium leading-6 text-pretty">
        <div className=keyColor> {`\"${key}\"`->React.string} </div>
        <div> {`:`->React.string} </div>
        <div className={`${valueColor} break-all`}>
          {if idx === dataLength - 1 {
            val->JSON.stringify->React.string
          } else {
            {`${val->JSON.stringify},`->React.string}
          }}
        </div>
      </div>
    }
  })
  ->React.array
}

let getArray = (dict, key) => {
  dict->getOptionalArrayFromDict(key)->Option.getOr([])
}
let resultToOption = (result: result<'a, 'b>) => {
  switch result {
  | Ok(data) => Some(data)
  | _ => None
  }
}

let returnNonDefault = (parsedValue, defaultValue) => {
  if parsedValue == defaultValue {
    None
  } else {
    Some(parsedValue)
  }
}

let encodeJsonObject = (json: JSON.t) => {
  json
}

let encodeFloatArray = (arr: array<float>) => {
  arr->Array.map(JSON.Encode.float)->JSON.Encode.array
}

let encodeIntArray = (arr: array<int>) => {
  arr->Array.map(JSON.Encode.int)->JSON.Encode.array
}

let encodeStrArray = (arr: array<string>) => {
  arr->Array.map(JSON.Encode.string)->JSON.Encode.array
}

let encodeBool = (bool: bool) => {
  bool->JSON.Encode.bool
}

let encodeFloat = (num: float) => {
  num->JSON.Encode.float
}

let encodeInt = (num: int) => {
  num->JSON.Encode.int
}

let encodeOptionalJson = (json: option<JSON.t>) => {
  json->Option.mapOr(JSON.Encode.null, encodeJsonObject)
}

let encodeOptionFloatArray = (arr: option<array<float>>) => {
  arr->Option.mapOr(JSON.Encode.null, encodeFloatArray)
}

let encodeOptionIntArray = (arr: option<array<int>>) => {
  arr->Option.mapOr(JSON.Encode.null, encodeIntArray)
}

let encodeOptionStrArray = (arr: option<array<string>>) => {
  arr->Option.mapOr(JSON.Encode.null, encodeStrArray)
}

let encodeOptionBool = (bool: option<bool>) => {
  bool->Option.mapOr(JSON.Encode.null, JSON.Encode.bool)
}

let encodeOptionFloat = (num: option<float>) => {
  num->Option.mapOr(JSON.Encode.null, encodeFloat)
}

let encodeOptionInt = (num: option<int>) => {
  num->Option.mapOr(JSON.Encode.null, encodeInt)
}

let encodeOptionString = (str: option<string>) => {
  str->Option.mapOr(JSON.Encode.null, JSON.Encode.string)
}

let encodeString = (str: string) => {
  str->JSON.Encode.string
}
let timeoutID = ref(None)

let debounce = (fn, delay: int) => {
  switch timeoutID.contents {
  | Some(id) => Js.Global.clearTimeout(id)
  | None => ()
  }
  timeoutID := Some(Js.Global.setTimeout(_ => fn(), delay))
}

@genType
let fetchTime = (secondss: int) => {
  if secondss / 3600 >= 1 {
    (Int.toString(secondss / 3600), "hour")
  } else if secondss / 60 >= 1 {
    (
      Int.toString(secondss / 60),
      "min
      ",
    )
  } else {
    (Int.toString(secondss), "sec")
  }
}

let calculateUTCDifference = (time1: string, time2: string) => {
  let t1 = getDayJsForString(time1)
  let t2 = getDayJsForString(time2)
  let differenceMs = t1.diff(t2, "s")
  differenceMs
}

let snakeCaseToTitleCase = (str: string): string => {
  str
  ->String.split("_")
  ->Array.map(word => {
    String.toUpperCase(String.substring(word, ~start=0, ~end=1)) ++
    String.toLowerCase(String.substringToEnd(~start=1, word))
  })
  ->Array.join(" ")
}

let dpToPercentageHeight = (dp: float) => {
  let screenHeight = ReactNative.Dimensions.get(#screen).height
  dp /. screenHeight *. 100.0
}
@genType
let percentageHeightToDp = (percentage: float) => {
  let screenHeight = ReactNative.Dimensions.get(#screen).height
  percentage *. screenHeight /. 100.0
}
@genType
let percentageWidthToDp = (percentage: float) => {
  let screenWidth = ReactNative.Dimensions.get(#screen).width
  percentage *. screenWidth /. 100.0
}

let removeFirstElement = arr => {
  switch arr[0] {
  | None => []
  | Some(_) => Array.slice(arr, ~start=1, ~end=Array.length(arr))
  }
}

let removeLastElement = arr => {
  let len = Array.length(arr)
  switch arr[len - 1] {
  | None => []
  | Some(_) => Array.slice(arr, ~start=0, ~end=len - 1)
  }
}

let convertToRadians = (degree: float) => {
  degree *. Js.Math._PI /. 180.0
}

@genType
let haversineDistance = (lat1: float, lon1: float, lat2: float, lon2: float): float => {
  let earthRadius = 6371.0
  let lat1Rad = lat1->convertToRadians
  let lon1Rad = lon1->convertToRadians
  let lat2Rad = lat2->convertToRadians
  let lon2Rad = lon2->convertToRadians

  let dLat = lat2Rad -. lat1Rad
  let dLon = lon2Rad -. lon1Rad
  let a =
    Math.sin(dLat /. 2.0) *. Math.sin(dLat /. 2.0) +.
      Math.cos(lat1Rad) *. Math.cos(lat2Rad) *. Math.sin(dLon /. 2.0) *. Math.sin(dLon /. 2.0)
  let c = 2.0 *. Math.asin(Math.sqrt(a))
  earthRadius *. c
}

@genType
let mapWithUnit = (option: option<'a>, f: 'a => 'b) => {
  switch option {
  | Some(value) => {
      f(value)
      ()
    }
  | None => ()
  }
  ()
}

let useDebounce = (delay: int, value: string) => {
  let (debouncedValue, setDebouncedValue) = React.useState(_ => value)
  React.useEffect2(() => {
    let handler = setTimeout(() => {
      setDebouncedValue(_ => value)
    }, delay)
    Some(
      () => {
        clearTimeout(handler)
      },
    )
  }, (value, delay))
  debouncedValue
}

module String = {
  let decodeString = data => Js.Json.decodeString(data)
  let decodeStringResult = data =>
    Js.Json.decodeString(data)->Option.mapOr(Error("Invalid string"), x => Ok(x))
  let trim = str => Js.String2.trim(str)
  let split = (str, separator) => Js.String2.split(str, separator)
  let length = str => Js.String2.length(str)
}

module Object = {
  let decodeObject = data => Js.Json.decodeObject(data)
  let toJson = data => data->asJson
}

type object = Js.Json.t

let boolToString = boolean => {
  switch boolean {
  | true => "true"
  | false => "false"
  }
}

let has = (data, x) => {
  Js.Dict.get(data, x) != None
}

let indexOfKeyPresentAmong = (dict, arr) => {
  arr->Array.map(x => dict->has(x))->Array.findIndexOpt(x => x)
}

external runOnUIHack: string => ReactNative.Style.angle = "%identity"

let getResultExn = (x, ~message: string) =>
  switch x {
  | Ok(x) => x
  | Error(_) => Exn.raiseError(message)
  }

let getOptionExn = (x, ~message: string) =>
  switch x {
  | Some(x) => x
  | None => Exn.raiseError(message)
  }

let jsonNullToOption = (jsonObj: Js.Json.t) => {
  switch jsonObj {
  | Null => None
  | x => Some(x)
  }
}

let getQueryParamsDict = searchParams => {
  let dict = Dict.make()
  if searchParams->Js.String2.includes("=") {
    searchParams
    ->Js.String2.split("&")
    ->Js.Array2.forEach(paramStr => {
      let keyValArr = Js.String2.split(paramStr, "=")
      let key = keyValArr[0]->Option.getOr("")
      let value = if keyValArr->Array.length > 0 {
        keyValArr[1]->Option.getOr("")
      } else {
        ""
      }
      Dict.set(dict, key, value)
    })
  }
  dict
}
