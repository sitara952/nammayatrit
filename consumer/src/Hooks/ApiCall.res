open Utils
open TypeScriptModules
open ApiExceptions
open MMKV

external toObj: Dict.t<string> => {..} = "%identity"

let mmkv = MMKV.createMMKV()

let jsErrorHandler = (~error, ~onError: string => unit): unit => {
  switch Js.Exn.message(error) {
  | Some(msg) => {
      let msg = "api js error: " ++ msg
      Console.log(msg)
      onError(msg)
    }
  | None => {
      let msg = "api js error"
      Console.log(msg)
      onError(msg)
    }
  }
}

let commonHeaders: array<(string, string)> = [
  ("Content-Type", "application/json"),
  ("x-client-version", "3.0.3"),
  ("x-config-version", "1.0.0"),
  ("x-bundle-version", "1.0.0"),
  ("x-device", "google/sdk_gphone64_arm64/Android v14/2 GB/5.61 Inches/2220x1080px"),
  ("client-id", "995ff758-4efa-4d18-8f8f-f779521eb743"),
]

let getRequestHeaders = async (headers: option<array<(string, string)>>): array<(
  string,
  string,
)> => {
  let token = MMKV.getStringItem(mmkv, REGISTRATION_TOKEN)
  let sessionId = "4e32bf09-cc47-428c-ac6e-136dd64f2087" // ToDo: Fetch sessionId from EncryptedStorage
  Console.log2("REGISTRATION_TOKEN", token)
  let headers' =
    Array.concat(commonHeaders, [("token", Option.getOr(token, ""))])->Array.concat([
      ("session_id", sessionId),
    ])
  headers->Option.mapOr(headers', h => Array.concat(commonHeaders, h))
}

let callGetAPI = async (
  ~url: string,
  ~headers: option<array<(string, string)>>=?,
  ~onError: string => unit,
  ~onSuccess: JSON.t => unit,
): unit => {
  let requestUrl = ApiRoutes.baseUrl ++ url
  let requestHeaders = await getRequestHeaders(headers)
  Console.log(requestUrl)
  let request: Fetch.Request.init = {
    method: #GET,
    headers: Fetch.Headers.fromArray(requestHeaders),
  }
  try {
    let response = await Fetch.fetch(requestUrl, request)

    let responseJson = await response->Fetch.Response.json
    Console.log4(response->Fetch.Response.status, request.method, requestUrl, requestHeaders)
    Console.log2("response:", responseJson)
    onSuccess(responseJson)
  } catch {
  | Js.Exn.Error(e) => jsErrorHandler(~error=e, ~onError)
  }
}

let callGetAPI' = async (
  ~url: string,
  ~headers: option<array<(string, string)>>=?,
  ~body: option<JSON.t>=?,
): Js.Json.t => {
  let requestUrl = ApiRoutes.baseUrl ++ url
  let requestHeaders = await getRequestHeaders(headers)
  let request: Fetch.Request.init = {
    method: #GET,
    headers: Fetch.Headers.fromArray(requestHeaders),
    body: body->Option.mapOr(Fetch.Body.none, b => b->JSON.stringify->Fetch.Body.string),
  }
  let response = await Fetch.fetch(requestUrl, request)
  if !(response->Fetch.Response.ok) {
    let errorCode = response->Fetch.Response.status
    let errorStr = await response->Fetch.Response.text
    let errorObj: httpError = {
      errorType: fromStatusCode(errorCode),
      errorPayload: errorStr,
      errorMessage: "[GetCallApiError-" ++
      errorCode->Int.toString ++
      "]: API call error in " ++
      errorStr ++
      " in " ++
      requestUrl,
    }
    raise(APIError(errorObj))
  }
  let responseJson = await response->Fetch.Response.json
  Console.log4(response->Fetch.Response.status, request.method, requestUrl, requestHeaders)
  Console.log2("request:", request.body)
  Console.log2("response:", responseJson)
  responseJson
}

let callMethodAPI_ = (~method: Fetch.method) => async (
  ~url: string,
  ~headers: option<array<(string, string)>>=?,
  ~body: option<JSON.t>=?,
  ~onError: string => unit,
  ~onSuccess: JSON.t => unit,
): unit => {
  let requestUrl = ApiRoutes.baseUrl ++ url
  let requestHeaders = await getRequestHeaders(headers)

  let request: Fetch.Request.init = {
    method,
    headers: Fetch.Headers.fromArray(requestHeaders),
    body: body->Option.mapOr(Fetch.Body.none, b => b->JSON.stringify->Fetch.Body.string),
  }
  try {
    Console.log3("Request:", requestUrl, request)
    let response = await Fetch.fetch(requestUrl, request)
    let responseJson = await response->Fetch.Response.json
    Console.log6(
      "Response:",
      response->Fetch.Response.status,
      request.method,
      requestUrl,
      requestHeaders,
      responseJson,
    )
    onSuccess(responseJson)
  } catch {
  | Js.Exn.Error(e) => jsErrorHandler(~error=e, ~onError)
  }
}

let callMethodAPI' = (~method: Fetch.method) => async (
  ~url: string,
  ~headers: option<array<(string, string)>>=?,
  ~body: option<JSON.t>=?,
): Js.Json.t => {
  let requestUrl = ApiRoutes.baseUrl ++ url
  let requestHeaders = await getRequestHeaders(headers)

  let request: Fetch.Request.init = {
    method,
    headers: Fetch.Headers.fromArray(requestHeaders),
    body: body->Option.mapOr(Fetch.Body.none, b => b->JSON.stringify->Fetch.Body.string),
  }
  let response = await Fetch.fetch(requestUrl, request)
  if !(response->Fetch.Response.ok) {
    let errorCode = response->Fetch.Response.status
    let errorStr = await response->Fetch.Response.text
    Console.error(
      "An error occured: " ++ Js.Int.toString(errorCode) ++ " " ++ requestUrl ++ " " ++ errorStr,
    )
    let errorObj: httpError = {
      errorType: fromStatusCode(errorCode),
      errorPayload: errorStr,
      errorMessage: "[GetCallApiError-" ++
      errorCode->Int.toString ++
      "]: API call error in " ++
      errorStr ++
      " in " ++
      requestUrl,
    }
    raise(APIError(errorObj))
  }
  let responseJson = await response->Fetch.Response.json
  Console.log4(response->Fetch.Response.status, request.method, requestUrl, requestHeaders)
  Console.log2("request:", request.body)
  Console.log2("response:", responseJson)
  responseJson
}

let callPostAPI = callMethodAPI_(~method=#POST)
let callPostAPI' = callMethodAPI'(~method=#POST)

let callPutAPI = callMethodAPI_(~method=#PUT)
let callPutAPI' = callMethodAPI'(~method=#PUT)

let callDeleteAPI = callMethodAPI_(~method=#DELETE)
let callDeleteAPI' = callMethodAPI'(~method=#DELETE)
