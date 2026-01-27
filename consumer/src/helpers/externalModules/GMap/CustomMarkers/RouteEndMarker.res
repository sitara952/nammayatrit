open ReactNative
open Style

@react.component
let make = () => {
  let endMarker: ReactNative.Image.Source.t = Image.Source.fromRequired(
    Packager.require("../../../../resources/assets/png/ic_pickup_location_marker.png"),
  )

  <Image source=endMarker style={viewStyle(~width=50.->dp, ~height=50.->dp, ())} />
}
