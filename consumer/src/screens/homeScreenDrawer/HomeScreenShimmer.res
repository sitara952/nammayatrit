open ReactNative
open Tailwind

@react.component
let make = () => {
  <View style={tw("h-full w-full bg-white flex-col p-10px gap-10px")}>
    <View style={tw("w-full h-45px mt-15px")}>
      <ShimmerView isLoading=true height="100%" width="65%" />
    </View>
    <View style={tw("w-full h-45px")}>
      <ShimmerView isLoading=true height="100%" />
    </View>
    <View style={tw("w-full h-135px ")}>
      <ShimmerView isLoading=true height="100%" />
    </View>
    <View style={tw("w-full h-55px ")}>
      <ShimmerView isLoading=true height="100%" />
    </View>
  </View>
}
