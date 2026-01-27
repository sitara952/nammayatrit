open ReactNative
open Style

@react.component
let make = () => {
  let markerImg: ReactNative.Image.Source.t = Image.Source.fromRequired(
    Packager.require("imagesAndSvg/png/ny_ic_confirm_pickup_location_marker.png"),
  )

  <Image source=markerImg style={viewStyle(~width=24.->dp, ~height=30.->dp, ())} />
}
