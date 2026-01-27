open ReactNative
open Style
open RideTrackScreenType
open Tailwind

@react.component
let make = (~rideFlowState: RideFlowContext.rideFlowType, ~navigation as _, ~goToChatScreen) => {
  let ratingToPercentage = rating => rating *. 20.
  let translateY = Reanimated.useSharedValue(400.)
  let animatedStyle = Reanimated.useAnimatedStyle(() => {
    viewStyle(
      ~transform=[
        {
          ReactNative.Style.translateY(~translateY=translateY.value)
        },
      ],
      (),
    )
  })
  React.useEffect0(() => {
    translateY.value = Reanimated.withTiming(~toValue=0.0, ~userOption={duration: 900.})
    None
  })
  switch rideFlowState.rideDetail {
  | Some(rideDetailData) => {
      let driverDetail = rideDetailData.driverDetail

      <Reanimated.ReanimatedView
        style={viewStyle(
          ~backgroundColor=ThemebasedStyle.colorString.fillNeutralWhite,
          ~borderRadius=20.,
          ~shadowColor="#B5BBC5",
          ~shadowOffset=Style.offset(~width=40., ~height=44.),
          ~shadowRadius=2.,
          ~shadowOpacity=1.,
          (),
        )}>
        <View
          style={viewStyle(
            ~alignItems=#center,
            ~justifyContent=#center,
            ~marginTop=5.->dp,
            ~borderTopLeftRadius=20.,
            ~borderTopRightRadius=20.,
            (),
          )}>
          <View
            style={viewStyle(
              ~backgroundColor="#787093",
              ~width=44.->dp,
              ~height=5.->dp,
              ~borderRadius=8.,
              (),
            )}
          />
        </View>
        <View
          style={viewStyle(
            ~paddingHorizontal=20.->dp,
            ~paddingBottom=14.->dp,
            ~paddingTop=18.->dp,
            (),
          )}>
          <View
            style={viewStyle(
              ~flexDirection=#column,
              ~justifyContent=#center,
              ~alignItems=#"flex-start",
              (),
            )}>
            <View style={viewStyle(~flexDirection=#row, ())}>
              <View style={viewStyle(~flex=1.0, ())}>
                <Svg.SvgXml xml=UserIcon.svg2 />
              </View>
              {rideDetailData.rideStatus == RideBooking.RideStatus.NEW
                ? <View style={viewStyle(~width=100.->dp, ())}>
                    <TextWrapper
                      text=CUSTOM_TEXT({text: "OTP: " ++ rideDetailData.rideOtp})
                      textType={Head_800}
                    />
                  </View>
                : React.null}
            </View>
            <View
              style={viewStyle(
                ~flexDirection=#row,
                ~alignItems=#"flex-start",
                ~marginTop=14.->dp,
                ~marginBottom=6.->dp,
                (),
              )}>
              <View style={viewStyle(~flexDirection=#column, ~gap=4., ~flex=1., ())}>
                <TextWrapper
                  text={CUSTOM_TEXT({text: driverDetail.firstName ++ " " ++ driverDetail.lastName})}
                  textType={SHead_700}
                />
                <View>
                  {switch driverDetail.rating {
                  | Some(rating) =>
                    let ratingInPercentage = ratingToPercentage(rating)
                    let (ratingText, icon) = if ratingInPercentage > 95. {
                      ("Super Endorsed", RatingIcon.medal)
                    } else if ratingInPercentage < 15. {
                      ("New on Bridge", RatingIcon.newOnBridge)
                    } else {
                      (
                        Float.toFixed(ratingInPercentage, ~digits=0) ++ "% Endorsed",
                        RatingIcon.thumbsUp,
                      )
                    }
                    <View style={tw("flex-row items-center h-6 gap-1")}>
                      <Svg.SvgXml xml={icon} />
                      <TextWrapper
                        color={ThemebasedStyle.colorClass.textMid}
                        textType={SBody_600}
                        text={CUSTOM_TEXT({text: ratingText})}
                      />
                    </View>
                  | _ => React.null
                  }}
                </View>
              </View>
              {rideDetailData.rideStatus == RideBooking.RideStatus.NEW
                ? <PressableComponent onPress={goToChatScreen}>
                    <View
                      style={viewStyle(
                        ~height=46.->dp,
                        ~width=58.->dp,
                        ~borderRadius=26.,
                        ~flexDirection=#row,
                        ~justifyContent=#center,
                        ~alignItems=#center,
                        ~backgroundColor=ThemebasedStyle.colorString.fillInfoHigh,
                        ~gap=6.,
                        (),
                      )}>
                      <Svg.SvgXml xml=MessageIcon.svg />
                      <Svg.SvgXml xml=ArrowRightSmall.svg width="10px" height="10px" />
                    </View>
                  </PressableComponent>
                : React.null}
            </View>
          </View>
        </View>
      </Reanimated.ReanimatedView>
    }
  | None =>
    <Reanimated.ReanimatedView
      style={array([animatedStyle, viewStyle(~backgroundColor="white", ~borderRadius=30., ())])}>
      <View
        style={viewStyle(
          ~alignItems=#center,
          ~justifyContent=#center,
          // ~padding=10.->dp,
          ~marginTop=10.->dp,
          ~borderTopLeftRadius=20.,
          ~borderTopRightRadius=20.,
          (),
        )}>
        <View
          style={viewStyle(
            ~backgroundColor="#787093",
            ~width=34.->dp,
            ~height=4.->dp,
            ~borderRadius=8.,
            (),
          )}
        />
      </View>
      <View
        style={viewStyle(
          ~flexDirection=#column,
          ~justifyContent=#"space-between",
          ~padding=15.->dp,
          ~gap=10.,
          (),
        )}>
        <ShimmerView isLoading=true height="60" width="60" radius=Some(16.) speed=1.0 />
        <View style={viewStyle(~flexDirection=#row, ~justifyContent=#"space-between", ())}>
          <View
            style={viewStyle(
              ~flexDirection=#column,
              ~width=100.->pct,
              ~justifyContent=#"space-between",
              ~gap=10.,
              (),
            )}>
            <View style={viewStyle(~flexDirection=#row, ~justifyContent=#"space-between", ())}>
              <View style={viewStyle(~flexDirection=#column, ~gap=10., ())}>
                <ShimmerView isLoading=true height="20" width="100" speed=1.0 />
                <ShimmerView isLoading=true height="20" width="90" speed=1.0 />
              </View>
              <ShimmerView isLoading=true height="50" width="60" radius={Some(16.)} speed=1.0 />
            </View>
          </View>
        </View>
      </View>
    </Reanimated.ReanimatedView>
  }
}
