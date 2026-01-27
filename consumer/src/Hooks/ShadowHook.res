open ReactNative
open Style
let useGetShadowStyle = (
  ~shadowIntensity,
  ~shadowColor="black",
  ~elevation=shadowIntensity,
  ~shadowRadius=shadowIntensity,
  ~shadowOpacity=0.5,
  ~shadowOffsetHeight=shadowIntensity /. 2.,
  ~shadowOffsetWidth=0.,
  (),
) => {
  viewStyle(
    ~elevation,
    ~shadowRadius,
    ~shadowOpacity,
    ~shadowOffset={
      offset(~width=shadowOffsetWidth, ~height=shadowOffsetHeight)
    },
    ~shadowColor,
    (),
  )
}
