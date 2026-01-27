open ProfileRes
open Utils

let profileGetApiCall = async (
  toss: option<int>,
  tenant: option<string>,
  context: option<string>,
) => {
  let data = await ApiCall.callGetAPI'(
    ~url="/profile" ++
    ("?" ++
    Option.mapOr(toss, "", x => "&toss=" ++ x->Js.Int.toString) ++
    Option.mapOr(tenant, "", x => "&tenant=" ++ x) ++
    Option.mapOr(context, "", x => "&context=" ++ x)),
  )
  ProfileRes.decodeProfileRes(data)
}
