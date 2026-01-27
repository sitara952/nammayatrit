open Utils

let getUiConfigsPostApiCall = async (toss: option<int>, tenant: option<string>, body: object) => {
  let data = await ApiCall.callPostAPI'(
    ~url="/getUiConfigs" ++
    ("?" ++
    Option.mapOr(toss, "", x => "&toss=" ++ x->Js.Int.toString) ++
    Option.mapOr(tenant, "", x => "&tenant=" ++ x)),
    ~body=body->Object.toJson,
  )
  Object.decodeObject(data)
}
