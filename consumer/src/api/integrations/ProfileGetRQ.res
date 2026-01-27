open ReactQuery
open ProfileGet

module Keys = {
  let all = ["profileGet"]
}
let useProfileGet = (~toss: option<int>, ~tenant: option<string>, ~context: option<string>) => {
  useQuery({
    queryKey: Keys.all,
    queryFn: _ =>
      profileGetApiCall((toss: option<int>), (tenant: option<string>), (context: option<string>)),
  })
}
