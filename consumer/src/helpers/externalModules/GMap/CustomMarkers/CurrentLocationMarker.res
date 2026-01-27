open ReactNative
open Style

@react.component
let make = () => {
  let currMarker: ReactNative.Image.Source.t = Image.Source.fromRequired(
    Packager.require("../../../resources/assets/png/ny_ic_current_pos_marker.png"),
  )

  <Image source=currMarker style={viewStyle(~width=75.->dp, ~height=75.->dp, ())} />
}
