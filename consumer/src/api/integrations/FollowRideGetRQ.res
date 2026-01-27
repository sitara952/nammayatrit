// open FollowersArray
// open ReactQuery
// open FollowRideGet

// module Keys = {
//   let all = ["followRideGet"]
// }

// let refetchIntervalCondition = (
//   ~data: option<result<array<result<Followers.followers, exn>>, exn>>,
// ) => {
//   switch data {
//   | Some(Ok(res)) => true
//   | _ => true
//   }
// }

// let useFollowRideGet = (~queryKey, ~refetchIntervalTime: int=1000) => {
//   useQuery({
//     queryKey,
//     queryFn: _ => followRideGetApiCall(),
//     refetchInterval: data =>
//       refetchInterval(
//         refetchIntervalCondition(~data=data.state.data)
//           ? #number(refetchIntervalTime)
//           : #bool(false),
//       ),
//   })
// }

