open ReactNative
open Style
open Reanimated
open Tailwind

type cancellationReason = {
  icon: ReactNative.Image.Source.t,
  reason: string,
}

let cancellationReasons: array<cancellationReason> = [
  {
    icon: Image.Source.fromRequired(
      Packager.require("../../../resources/assets/png/cancellationReason/driver_abusive.png"),
    ),
    reason: "The driver is abusive",
  },
  {
    icon: Image.Source.fromRequired(
      Packager.require("../../../resources/assets/png/cancellationReason/car_unhygienic.png"),
    ),
    reason: "The car is unhygienic",
  },
  {
    icon: Image.Source.fromRequired(
      Packager.require("../../../resources/assets/png/cancellationReason/driver_late.png"),
    ),
    reason: "Driver arrived very late",
  },
  {
    icon: Image.Source.fromRequired(
      Packager.require("../../../resources/assets/png/cancellationReason/rash_driving.png"),
    ),
    reason: "Dangerous and rash driving",
  },
]

module CancelConfirmation = {
  @react.component
  let make = (~onPressButton1: unit => unit, ~onPressButton2: unit => unit) => {
    <PopUpModal
      popUpModalType=PopUpModal.PopUp1({
        title: {CANCEL_RIDE},
        onClose: None,
        primaryText: {DRIVER_MIGHT_BE_ON_HIS_WAY},
        button1: Some({
          text: {CANCEL_ANYWAY},
          onPress: () => onPressButton1(),
        }),
        button2: Some({
          text: {DONT_CANCEL},
          onPress: () => onPressButton2(),
        }),
      })
    />
  }
}

module CancelReason = {
  @react.component
  let make = (~bookingId, ~setIsKeyboardOpen, ~rideCancelSuccessListener: unit => unit) => {
    let translateY = useSharedValue(-1.0)
    let parentHeight = useSharedValue(0.)
    let collapsableLayoutHeight = React.useRef(0.)
    let (input, setInput) = React.useState(_ => None)
    let (selectedIndex, setSelectedIndex) = React.useState(_ => None)

    let handlePress = (index: int) => {
      setSelectedIndex(_ => Some(index))
      translateY.value = withTiming(
        ~toValue=Int.toFloat(index) *. 51.5,
        ~userOption={duration: 400.},
      )
    }
    let handleKeyboardStateChange = (isFocused: bool) => {
      if isFocused {
        setIsKeyboardOpen(_ => true)
        parentHeight.value = withTiming(~toValue=15., ~userOption={duration: 200.})
      } else {
        setIsKeyboardOpen(_ => false)
        parentHeight.value = withTiming(
          ~toValue=collapsableLayoutHeight.current,
          ~userOption={duration: 200.},
        )
      }
    }
    React.useEffect0(() => {
      if Platform.os == #android {
        Keyboard.addListener(#keyboardDidHide, _ => {
          Keyboard.dismiss()
        })->ignore
      }
      None
    })
    let collapsableLayoutChange = (event: Event.layoutEvent) => {
      if collapsableLayoutHeight.current == 0.0 {
        let height = event.nativeEvent.layout.height
        height != 0. ? collapsableLayoutHeight.current = height : ()
        parentHeight.value = height
      }
    }

    let cancelRideApiCall = (bookingId: string) => {
      let cancelReasonCode = switch selectedIndex {
      | Some(index) =>
        switch cancellationReasons->Array.get(index) {
        | Some(selectedReason) => selectedReason.reason
        | None => ""
        }
      | None => ""
      }
      let cancelApiReq =
        CancelRide.makeCancelRideRequest(input, cancelReasonCode, "OnAssign")->CancelRide.toJson
      ApiCall.callPostAPI(
        ~url=ApiRoutes.apiRoutes.cancelRide(bookingId),
        ~body=cancelApiReq,
        ~onSuccess={
          _ => rideCancelSuccessListener()
        },
        ~onError={
          err => {
            Console.error2("cancelRide ERROR API", err)
          }
        },
      )->ignore
    }

    let collapsableStyle = useAnimatedStyle(() =>
      if parentHeight.value == 0.0 {
        viewStyle()
      } else {
        viewStyle(~height=parentHeight.value->dp, ())
      }
    )
    let selectedTextStyle = useAnimatedStyle(() =>
      viewStyle(~transform=[ReactNative.Style.translateY(~translateY=translateY.value)], ())
    )

    let cancelReasonView = (cancelReason: cancellationReason, index: int) => {
      <View key={string_of_int(index)}>
        <TouchableOpacity activeOpacity=1.0 onPress={_ => handlePress(index)}>
          <View style={tw(`ml-5 flex-row`)}>
            <Image source=cancelReason.icon style={tw(`w-3.5 h-3.5 self-center`)} />
            <View style={tw(`pt-3.75 mx-2.5`)}>
              <Reanimated.AnimatedText style={array([tw(`sHead_600 text-[#5F616B] pb-2.75`)])}>
                {cancelReason.reason->React.string}
              </Reanimated.AnimatedText>
            </View>
          </View>
          <ReanimatedView style={array([tw(`m-0.5 h-0.25 mx-5 bg-fillNeutralLow`)])} />
        </TouchableOpacity>
      </View>
    }

    <View style={tw(`h-full w-full absolute justify-end`)}>
      <View style={tw(`bg-white rounded-t-3xl py-2.5`)}>
        <TouchableWithoutFeedback onPress={_ => ()}>
          <ReanimatedView
            onLayout={event => collapsableLayoutChange(event)} style={array([collapsableStyle])}>
            <View style={tw(`bg-white flex-col w-full rounded-t-3xl pt-5 py-1.25`)}>
              <View style={tw(`px-5 pt-1`)}>
                <Svg.SvgXml xml=CancelCarIcon.svg width={"60"} height={"60"} />
              </View>
              <TextWrapper
                text=LET_US_KNOW_THE_REASON_FOR_CANCELLATION
                textType={Head_800}
                color=ThemebasedStyle.colorClass.textBlack
                overRideStyle={viewStyle(~paddingHorizontal=20.->dp, ~marginTop=15.->dp, ())}
              />
              <View style={tw(`mt-5.5`)}>
                // animated dark view
                {switch selectedIndex {
                | Some(_) =>
                  <ReanimatedView
                    style={array([
                      tw(
                        `bg-fillNeutralLow absolute w-full h-14` ++ (
                          Option.isSome(selectedIndex) ? `z-0` : `-z-10`
                        ),
                      ),
                      selectedTextStyle,
                    ])}
                  />
                | None => React.null
                }}
                // reasons list
                <View>
                  {cancellationReasons
                  ->Array.mapWithIndex((item, index) => cancelReasonView(item, index))
                  ->React.array}
                </View>
              </View>
            </View>
          </ReanimatedView>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback onPress={_ => ()}>
          <View style={tw(`bg-white pb-4 mt-1.25`)}>
            // edit text
            <View>
              <GorhomBottomSheet.BottomSheetTextInput
                onBlur={_ => handleKeyboardStateChange(false)}
                onFocus={_ => {
                  handleKeyboardStateChange(true)
                  setSelectedIndex(_ => None)
                }}
                style={array([
                  textStyle(~fontStyle=#normal, ~color={"#000000"}, ~fontSize=17., ()),
                  tw(`px-4.0 py-3.0`),
                ])}
                multiline=true
                onChangeText={val => setInput(_ => Some(val))}
                placeholder="Express your issue"
                placeholderTextColor=ThemebasedStyle.colorClass.textMid
              />
            </View>
            // submit button
            <PressableComponent
              style={tw(`mx-3.75 mt-2`)}
              onPress={_ => {
                if Option.isSome(selectedIndex) || input != None {
                  cancelRideApiCall(bookingId)
                }
              }}>
              <View
                style={
                  let backgroundColor =
                    Option.isSome(selectedIndex) || input != None
                      ? `bg-ctaPrimaryActive`
                      : `bg-ctaPrimaryDisabled`
                  tw(backgroundColor ++ ` ` ++ `py-4 rounded-lg mb-5`)
                }>
                <TextWrapper
                  text={SUBMIT}
                  textType={SHead_700}
                  overRideStyle={tw(`text-center`)}
                  color={Option.isSome(selectedIndex) || input != None
                    ? ThemebasedStyle.colorClass.textWhite
                    : ThemebasedStyle.colorClass.textMid}
                />
              </View>
            </PressableComponent>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </View>
  }
}
