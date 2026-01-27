open ReactNative
open Tailwind

@react.component
let make = (~loading) => {
  <View style={tw(" pb-5   flex-row justify-between ")}>
    <View style={tw(" justify-start")}>
      <ShimmerView isLoading=loading height="25" width="47" />
    </View>
    <View style={tw(" justify-end gap-2 flex-row")}>
      <ShimmerView isLoading=loading height="25" width="37" />
      <ShimmerView isLoading=loading height="25" width="50" />
    </View>
  </View>
}
