open ReactNative
open Style
open DayJs
open Tailwind
dayJs.extend(localizedFormat)

@react.component
let make = (
  ~imageName: string="",
  ~title: string="",
  ~subtitle: string="",
  ~capacity: string="",
  ~pickupTime: string="",
  ~fare: string="",
  ~estimateFareBreakup: array<FareBreakupHelper.estimateFareBreakupItem>=[],
  ~isSelected: bool=false,
  ~index,
  ~setIsSelected,
  ~selectedRide: Reanimated.SharedValue.t<int>,
  ~estimatedDuration: option<int>,
  ~loading as _,
) => {
  let (modal, setModal, closeModal) = React.useContext(BottomSheetModalContext.modalContext)

  let onPressHandler = _ => {
    selectedRide.value = index
    setIsSelected(_ => index)
  }

  let selectedRideDerivedValue = Reanimated.useDerivedValue(() => {
    if selectedRide.value === index {
      Reanimated.withTiming(~toValue=1., ~userOption={duration: 400.})
    } else {
      Reanimated.withTiming(~toValue=0., ~userOption={duration: 400.})
    }
  })

  let animatedSelectedIndicatorStyle = Reanimated.useAnimatedStyle(() => {
    viewStyle(
      ~width=Reanimated.interpolate(selectedRideDerivedValue.value, [0., 1.], [0., 5.], None)->dp,
      (),
    )
  })

  let animatedLightStyle = Reanimated.useAnimatedStyle(() => {
    viewStyle(
      ~opacity=Reanimated.interpolate(
        selectedRideDerivedValue.value,
        [0., 0.3, 0.6, 1.],
        [0., 1., 0., 1.],
        None,
      ),
      (),
    )
  })
  let selectedContainerStyle = Reanimated.useAnimatedStyle(() => {
    viewStyle(
      ~backgroundColor=Reanimated.interpolateColor(
        selectedRideDerivedValue.value,
        [0., 1.],
        ["white", ThemebasedStyle.colorString.fillNeutralLow],
        None,
      ),
      (),
    )
  })

  let estimatedFareModalHandler = {
    _ => {
      setModal({
        ...modal,
        modalComponent: Some(<RateCardPopup estimateFareBreakup dismissPopup=closeModal />),
      })
    }
  }

  <Reanimated.ReanimatedView style={array([selectedContainerStyle])}>
    <TouchableOpacity
      activeOpacity={1.0}
      onPress=onPressHandler
      style={viewStyle(
        ~flexDirection=#row,
        ~minHeight=80.->dp,
        ~width=100.->pct,
        ~display=#flex,
        ~overflow=#hidden,
        (),
      )}>
      {<Reanimated.ReanimatedView
        style={array([
          viewStyle(~backgroundColor=ThemebasedStyle.colorString.fillPrimaryHigh, ()),
          animatedSelectedIndicatorStyle,
        ])}
      />}
      <View
        style={viewStyle(
          ~flexDirection=#row,
          ~alignItems=#center,
          ~padding=15.->dp,
          ~width=100.->pct,
          ~display=#flex,
          ~overflow=#hidden,
          (),
        )}>
        <View
          style={viewStyle(
            ~maxHeight=70.->dp,
            ~display=#flex,
            ~alignItems=#center,
            ~justifyContent=#center,
            (),
          )}>
          <Image
            source={VehicleHelper.getVehicleImageName(title)}
            style={imageStyle(~height=35.->dp, ~width=65.->dp, ~objectFit=#"scale-down", ())}
          />
        </View>
        <Reanimated.ReanimatedView
          style={array([
            viewStyle(~maxHeight=70.->dp, ~position=#absolute, ~left=45.->dp, ()),
            animatedLightStyle,
          ])}>
          <Svg.SvgXml xml=Vehicle.torch />
        </Reanimated.ReanimatedView>
        <View
          style={viewStyle(
            ~display=#flex,
            ~flex=1.,
            ~flexDirection=#column,
            // ~justifyContent=#"space-between",
            (),
          )}>
          <View
            style={viewStyle(
              ~display=#flex,
              ~flex=1.,
              ~flexDirection=#row,
              ~justifyContent=#"space-between",
              ~alignItems=#center,
              ~marginLeft=10.->dp,
              (),
            )}>
            <View
              style={viewStyle(
                ~display=#flex,
                ~flex=1.,
                ~flexDirection=#row,
                ~justifyContent=#"flex-start",
                ~alignItems=#center,
                ~maxWidth=150.->dp,
                (),
              )}>
              <TextWrapper
                color=ThemebasedStyle.colorClass.textBlack
                textType={Body_600}
                text=CUSTOM_TEXT({text: title})
              />
              {capacity == "0"
                ? React.null
                : <View
                    style={viewStyle(
                      ~display=#flex,
                      ~flexDirection=#row,
                      ~justifyContent=#"flex-start",
                      ~alignItems=#center,
                      ~marginLeft=8.->dp,
                      ~marginBottom=1.->dp,
                      ~gap=3.,
                      // ~borderWidth=1.,
                      (),
                    )}>
                    <Svg.SvgXml xml=Vehicle.userSvg height="12px" width="12px" />
                    <TextWrapper
                      textType={SBody_400}
                      text=CUSTOM_TEXT({text: capacity})
                      overRideStyle={tw("mt-1px")}
                    />
                  </View>}
            </View>
            <TouchableOpacity onPress=estimatedFareModalHandler>
              <TextWrapper
                color=ThemebasedStyle.colorClass.textBlack
                textType={Body_700}
                text=CUSTOM_TEXT({text: fare})
              />
            </TouchableOpacity>
          </View>
          <View
            style={viewStyle(
              ~display=#flex,
              ~flex=1.,
              ~flexDirection=#row,
              ~justifyContent=#"space-between",
              ~alignItems=#center,
              ~marginLeft=10.->dp,
              (),
            )}>
            <TextWrapper
              color=ThemebasedStyle.colorClass.textMid
              textType={SBody_600}
              text={CUSTOM_TEXT({text: subtitle})}
            />
            <View
              style={viewStyle(
                ~display=#flex,
                ~flex=1.,
                ~flexDirection=#row,
                ~justifyContent=#"flex-start",
                ~alignItems=#center,
                ~marginLeft=6.->dp,
                (),
              )}>
              {pickupTime == "" ? React.null : <Svg.SvgXml xml=Vehicle.dotSvg />}
              <TextWrapper
                color=ThemebasedStyle.colorClass.textMid
                textType={SBody_600}
                text={CUSTOM_TEXT({text: pickupTime})}
                overRideStyle={tw("ml-6px")}
              />
            </View>
            {switch estimatedDuration {
            | Some(estimateTime) =>
              <View style={viewStyle(~display=#flex, ~marginTop=2.->dp, ())}>
                <TextWrapper
                  color=ThemebasedStyle.colorClass.textMid
                  textType={SBody_600}
                  text={CUSTOM_TEXT({
                    text: {DayJs.getDayJs().add(estimateTime, "s").format("LT")},
                    accessibilityHintOverride: pickupTime,
                  })}
                />
              </View>
            | None => React.null
            }}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  </Reanimated.ReanimatedView>
}
