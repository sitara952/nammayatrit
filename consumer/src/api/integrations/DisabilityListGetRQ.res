open DisabilityArray
open ReactQuery
open DisabilityListGet

module Keys = {
  let all = ["disabilityListGet"]
}
let useDisabilityListGet = (~queryKey) => {
  useQuery({
    queryKey,
    queryFn: _ => disabilityListGetApiCall(),
  })
}
