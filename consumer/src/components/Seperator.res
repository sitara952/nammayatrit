open ReactNative
open Style

@react.component
let make = (~height=1., ~margin=2.0, ~color="#171723") => {
  <>
    <Space height=margin />
    <View style={viewStyle(~height=height->dp, ~backgroundColor=color, ())} />
    <Space height=margin />
  </>
}
