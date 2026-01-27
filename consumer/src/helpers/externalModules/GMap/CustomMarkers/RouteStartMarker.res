open ReactNative
open Style

@react.component
let make = (~source: ReactNative.Image.Source.t, ~height: float, ~width: float) => {
  <Image
    source
    resizeMode={#contain}
    style={viewStyle(~width=width->dp, ~height=height->dp, ~overflow=#visible, ())}
  />
}
