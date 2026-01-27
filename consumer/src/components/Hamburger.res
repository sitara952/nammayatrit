open ReactNative
open Style

@react.component
let make = (~onPress) => {
  let getShadowStyle = ShadowHook.useGetShadowStyle(~shadowIntensity=2., ())
  <View>
    <PressableComponent
      onPress
      style={array([
        getShadowStyle,
        viewStyle(
          ~backgroundColor="white",
          ~width=48.->dp,
          ~height=40.->dp,
          ~alignItems=#center,
          ~alignContent=#center,
          ~justifyContent=#center,
          ~borderRadius=19.,
          ~padding=14.->dp,
          (),
        ),
      ])}>
      <Svg.SvgXml xml=HamburgerIcon.svgBlack height="14" width="14" />
    </PressableComponent>
  </View>
}
