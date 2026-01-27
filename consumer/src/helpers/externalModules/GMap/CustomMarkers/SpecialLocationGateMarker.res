open ReactNative
open Style

@react.component
let make = (~active=false: bool) => {
  let currMarker: ReactNative.Image.Source.t = Image.Source.fromRequired(
    Packager.require("../../../../resources/assets/png/mt_ic_pickup_gate.png"),
  )

  <Image source=currMarker style={viewStyle(~width=15.->dp, ~height=15.->dp, ())} />
}
