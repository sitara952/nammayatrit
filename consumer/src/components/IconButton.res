open ReactNative
open Style

@react.component
let make = (
  ~icon=Cancel.svg,
  ~width=44.0->dp,
  ~height=36.->dp,
  ~padding=5.0->dp,
  ~onPress=_ => (),
  ~backgroundColor="white",
  ~style: Style.t=viewStyle(
    ~alignItems=#center,
    ~justifyContent=#center,
    ~borderRadius=100.0,
    ~width,
    ~height,
    ~padding,
    ~backgroundColor,
    (),
  ),
) => {
  <TouchableOpacity onPress style>
    <Svg.SvgXml xml=icon width="100%" height="100%" />
  </TouchableOpacity>
}
