open Reanimated
open Tailwind
open ReactNative
open Style

let containerWidth = Dimensions.get(#screen).width -. 48.

@react.component
let make = (
  ~animatedPosition: SharedValue.t<'t>,
  ~parameters: DriverFeedbackType.driverFeedbackParams,
) => {
  let animatedSectionStyle = useAnimatedStyle(() => {
    viewStyle(~opacity=interpolate(animatedPosition.value, [-75., 0., 75.], [0., 1., 0.], None), ())
  })

  let animatedThumbsUpStyle = useAnimatedStyle(() => {
    viewStyle(
      ~height=interpolate(
        animatedPosition.value,
        [0., 100.],
        [0., 100.],
        Some(Reanimated.ExtrapolationType.asString("clamp")),
      )->dp,
      ~opacity=interpolate(
        animatedPosition.value,
        [0., 100.],
        [0., 1.],
        Some(Reanimated.ExtrapolationType.asString("clamp")),
      ),
      (),
    )
  })

  let animatedThumbsDownStyle = useAnimatedStyle(() => {
    viewStyle(
      ~height=interpolate(
        animatedPosition.value,
        [-100., 0.],
        [100., 0.],
        Some(Reanimated.ExtrapolationType.asString("clamp")),
      )->dp,
      ~opacity=interpolate(
        animatedPosition.value,
        [-100., 0.],
        [1., 0.],
        Some(Reanimated.ExtrapolationType.asString("clamp")),
      ),
      (),
    )
  })

  <ReanimatedView
    style={array([
      tw("mt-5 rounded-[18px] bg-white overflow-hidden"),
      tw(`w-[${Float.toString(containerWidth)}px]`),
    ])}>
    <ReanimatedView />
    <ReanimatedView
      style={array([
        tw("bg-white pt-5 pb-6 items-center justify-center px-4"),
        animatedSectionStyle,
      ])}>
      <TextWrapper text={CUSTOM_TEXT({text: parameters.driverName})} textType={SBody_700} />
      <TextWrapper
        text=ENDORSE_YOUR_DRIVER textType={Head_800} overRideStyle={tw("text-center pt-2.5")}
      />
      <TextWrapper
        textType={SBody_600} text={SWIPE_TO_RATE} overRideStyle={tw("text-[#7A8697] pt-4")}
      />
    </ReanimatedView>
    <ReanimatedView
      style={array([
        tw("absolute bottom-6 w-full items-center justify-center overflow-hidden"),
        animatedThumbsUpStyle,
      ])}>
      <IconWrapper size="h-[100px]" icon={() => <ThumbsUpIcon />} />
    </ReanimatedView>
    <ReanimatedView
      style={array([
        tw("absolute bottom-6 w-full items-center justify-center overflow-hidden"),
        animatedThumbsDownStyle,
      ])}>
      <IconWrapper size="h-[100px]" icon={() => <ThumbsDownIcon />} />
    </ReanimatedView>
  </ReanimatedView>
}
