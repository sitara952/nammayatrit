open RouteInfoArray
open GetRoutesReq
open ReactQuery
open RoutePost

module Keys = {
  let all = ["routePost"]
}
let useRoutePost = (~mutationKey) => {
  useMutation({
    mutationKey,
    mutationFn: (body: getRoutesReq) => routePostApiCall((body: getRoutesReq)),
  })
}
