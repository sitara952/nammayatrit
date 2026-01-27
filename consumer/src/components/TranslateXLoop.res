open Reanimated
open ReactNative
open Style

@react.component
let make = (~children: React.element, ~style: Style.t) => {
  let elementPosition = useSharedValue(0.)
  // ** Need bindings for `withRepeat``
  // React.useEffect(() => {
  //   elementPosition.value = withRepeat(
  //     withSpring(
  //       ~toValue=2.,
  //       ~userConfig={
  //         damping: Some(28.),
  //         stiffness: Some(18.),
  //         overshootClamping: Some(true),
  //         restDisplacementThreshold: Some(0.001),
  //         restSpeedThreshold: Some(0.01),
  //         velocity: Some(1.0),
  //         mass: Some(1.0),
  //       },
  //     ),
  //     -1,
  //     true,
  //   )
  // }, [])

  let elementAnimatingStyle = useAnimatedStyle(() => {
    viewStyle(~transform=[ReactNative.Style.translateX(~translateX=elementPosition.value)], ())
  })

  <ReanimatedView style={array([style, elementAnimatingStyle])}> {children} </ReanimatedView>
}
