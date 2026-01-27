open ReactNative
open Style
open Reanimated
open Tailwind

@react.component
let make = (
  ~quote: ChooseRideTypes.quotesProp,
  ~index: float,
  ~selectedRide: SharedValue.t<float>,
  ~ridesLength: float,
  ~isLoading: bool,
) => {
  let isLastItem = index == ridesLength -. 1.

  let handleOnPress = _event => {
    selectedRide.value = index
  }

  let selectedRideDerivedValue = useDerivedValue(() => {
    if selectedRide.value === index {
      withTiming(~toValue=1.0, ~userOption={duration: 300.})
    } else {
      withTiming(~toValue=0.0, ~userOption={duration: 300.})
    }
  })

  let animatedSelectedIndicatorStyle = useAnimatedStyle(() => {
    viewStyle(~width=interpolate(selectedRideDerivedValue.value, [0., 1.], [0., 5.], None)->dp, ())
  })

  let selectedContainerStyle = useAnimatedStyle(() => {
    viewStyle(
      ~backgroundColor=interpolateColor(
        selectedRideDerivedValue.value,
        [0., 1.],
        ["white", "#ECEDF2"],
        None,
      ),
      (),
    )
  })

  let animatedLightStyle = useAnimatedStyle(() => {
    viewStyle(
      ~opacity=interpolate(
        selectedRideDerivedValue.value,
        [0., 0.3, 0.6, 1.],
        [0., 1., 0., 1.],
        None,
      ),
      (),
    )
  })

  let renderElement = (_interactionState: Pressable.interactionState) => {
    <ReanimatedView>
      <ReanimatedView
        style={array([tw("absolute h-full bg-[#9221FB] z-10"), animatedSelectedIndicatorStyle])}
      />
      <ReanimatedView style={array([tw("px-4"), selectedContainerStyle])}>
        <ReanimatedView
          style={array([
            tw("flex flex-row relative py-[19px]"),
            !isLastItem ? tw("border-b-[1px] border-[#ECEDF2]") : tw(""),
          ])}>
          {isLoading
            ? <ReanimatedView style={tw("absolute bottom-[13px] left-0.5")}>
                <ShimmerView
                  bgColor="#E0E3E8"
                  fgColor="#F4F5F6"
                  isLoading=true
                  height="50"
                  width={Belt.Float.toString(50. *. quote.ar)}
                />
              </ReanimatedView>
            : <ReanimatedView
                // TODO: Add Entering/Exiting Animations on every conditional renders
                style={tw("absolute bottom-0.5 overflow-visible w-[90px]")}>
                <Image
                  source={quote.imgSource}
                  style={imageStyle(
                    ~height=70.0->dp,
                    ~resizeMode=#cover,
                    ~aspectRatio=quote.ar,
                    (),
                  )}
                />
                <AnimatedImage
                  style={array([
                    tw("absolute z-20 h-[68px] w-[51.5px] -right-1.5"),
                    animatedLightStyle,
                  ])}
                  source={Image.Source.fromRequired(
                    Packager.require("../../resources/assets/png/choose-ride-assets/light.png"),
                  )}
                />
              </ReanimatedView>}
          <ReanimatedView style={tw("flex-1 pl-22")}>
            <ReanimatedView style={tw("flex flex-row items-center justify-between")}>
              <ReanimatedView style={tw("flex flex-row items-center")}>
                {isLoading
                  ? <ShimmerView
                      bgColor="#E0E3E8" fgColor="#F4F5F6" isLoading=true height="18" width="100"
                    />
                    // TODO: Add Entering/Exiting Animations on every conditional renders
                  : <>
                      <AnimatedText
                        style={tw("text-[15px] leading-[18px] font-extraBold text-[#161622]")}>
                        {React.string(quote.title)}
                      </AnimatedText>
                      <ReanimatedView
                        style={array([tw("h-3 ml-[5px] mr-1"), viewStyle(~aspectRatio=1.0, ())])}>
                        <UserIconSvg />
                      </ReanimatedView>
                      <AnimatedText
                        style={tw("text-[12px] leading-[15px] font-extraBold text-[#161622] pl-1")}>
                        {React.string(quote.noOfPersons->Js.Float.toString)}
                      </AnimatedText>
                    </>}
              </ReanimatedView>
              <ReanimatedView>
                {isLoading
                  ? <ShimmerView
                      bgColor="#E0E3E8" fgColor="#F4F5F6" isLoading=true height="18" width="50"
                    />
                    // TODO: Add Entering/Exiting Animations on every conditional renders
                  : <AnimatedText
                      style={tw("text-[15px] leading-[18px] font-extraBold text-[#161622]")}>
                      {React.string(quote.price)}
                    </AnimatedText>}
              </ReanimatedView>
            </ReanimatedView>
            <ReanimatedView style={tw("flex flex-row items-center justify-between pt-1")}>
              {isLoading
                ? <>
                    <ShimmerView
                      bgColor="#E0E3E8" fgColor="#F4F5F6" isLoading=true height="15" width="75"
                    />
                    <ShimmerView
                      bgColor="#E0E3E8" fgColor="#F4F5F6" isLoading=true height="15" width="35"
                    />
                  </>
                : // TODO: Add Entering/Exiting Animations on every conditional renders
                  <>
                    <AnimatedText style={tw("text-[12px] leading-[15px] font-bold text-[#7A8697]")}>
                      {React.string(quote.rideType)}
                      {React.string(" • ")}
                      {React.string(quote.duration->Js.Float.toString)}
                      {React.string(" mins")}
                    </AnimatedText>
                    <AnimatedText style={tw("text-[12px] leading-[15px] font-bold text-[#7A8697]")}>
                      {React.string(quote.destinationArrivalTime)}
                    </AnimatedText>
                  </>}
            </ReanimatedView>
          </ReanimatedView>
        </ReanimatedView>
      </ReanimatedView>
    </ReanimatedView>
  }

  <Pressable onPress={handleOnPress} key={quote.title}>
    {interactionState => renderElement(interactionState)}
  </Pressable>
}
