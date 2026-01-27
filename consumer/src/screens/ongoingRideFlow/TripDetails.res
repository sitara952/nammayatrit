open ReactNative
open Style
open RideTrackScreenType
open CancelRideStage
open DayJs
open Tailwind

type addressCardData = {
  primaryAddress: string,
  secondaryAddress?: string,
  heading?: string,
  description?: string,
}

module AddressCard = {
  @react.component
  let make = (~cardData: addressCardData) => {
    <View
      style={array([
        {
          viewStyle(
            ~width=100.0->pct,
            ~flexDirection=#row,
            ~alignSelf=#"flex-end",
            ~justifyContent=#"space-between",
            (),
          )
        },
      ])}>
      <View style={tw("justify-start items-start gap-1")}>
        <TextWrapper
          textType={Body_600}
          text=CUSTOM_TEXT({text: cardData.primaryAddress})
          truncate={Ellipsize(#tail)}
          overRideStyle={textStyle(~width=240.->dp, ())}
        />
        {switch cardData.secondaryAddress {
        | None => React.null
        | Some(address) =>
          <TextWrapper
            truncate={Ellipsize(#tail)}
            textType={SBody_400}
            text=CUSTOM_TEXT({text: address})
            overRideStyle={textStyle(~width=230.->dp, ~padding=2.->dp, ())}
          />
        }}
      </View>
      <View
        style={viewStyle(
          ~gap=6.,
          ~alignContent=#"flex-end",
          ~justifyContent=#center,
          ~alignItems=#"flex-end",
          (),
        )}>
        {switch cardData.heading {
        | None => React.null
        | Some(value) =>
          <TextWrapper
            color=ThemebasedStyle.colorClass.textHigh
            textType={SBody_600}
            text=CUSTOM_TEXT({text: value})
            overRideStyle={textStyle(~textAlign=#right, ())}
          />
        }}
        {switch cardData.description {
        | None => React.null
        | Some(value) =>
          <TextWrapper
            textType={SBody_600}
            text=CUSTOM_TEXT({text: value})
            overRideStyle={textStyle(~textAlign=#right, ())}
          />
        }}
      </View>
    </View>
  }
}

module AddressCardList = {
  @react.component
  let make = (~details=[], ~cardContainerPaddingLeft=5.0->dp) => {
    <View
      style={viewStyle(
        ~width=100.0->pct,
        ~flexDirection=#row,
        ~justifyContent=#"space-between",
        ~marginLeft=-12.->dp,
        (),
      )}>
      <View
        style={viewStyle(~width=10.0->pct, ~flexDirection=#column, ~justifyContent=#center, ())}>
        <View
          style={viewStyle(
            ~flex=0.25,
            ~width=100.0->pct,
            ~alignItems=#center,
            ~justifyContent=#center,
            (),
          )}
        />
        {details
        ->Array.mapWithIndex((_, index) =>
          index < Array.length(details) - 1
            ? <View
                key={index->Int.toString}
                style={viewStyle(
                  ~flex=1.0,
                  ~width=100.0->pct,
                  ~alignItems=#center,
                  ~justifyContent=#center,
                  (),
                )}>
                <Svg.SvgXml xml=BridgeSignVertical.svg width={"100%"} height={"100%"} />
              </View>
            : React.null
        )
        ->React.array}
        <View
          style={viewStyle(
            ~flex=0.25,
            ~width=100.0->pct,
            ~alignItems=#center,
            ~justifyContent=#center,
            (),
          )}
        />
      </View>
      <View
        style={viewStyle(
          ~flexDirection=#column,
          ~paddingLeft=cardContainerPaddingLeft,
          ~width=90.0->pct,
          (),
        )}>
        {details
        ->Array.mapWithIndex((item, index) =>
          <View key={index->Int.toString} style={viewStyle(~flexDirection=#column, ())}>
            {index > 0 && index < Array.length(details)
              ? <View style={viewStyle(~flexDirection=#row, ~alignItems=#center, ())}>
                  <View style={tw("w-11/12 p-1")}>
                    <Seperator color="#B7ABD2" margin=5.0 />
                  </View>
                </View>
              : React.null}
            <AddressCard cardData=item />
          </View>
        )
        ->React.array}
      </View>
    </View>
  }
}

@react.component
let make = (
  ~navigation,
  ~currentSnapPoint as _,
  ~rideFlowState: RideFlowContext.rideFlowType,
  ~setCancelRideStage,
  ~shareRide: RideTrackScreenType.rideDetail => unit,
) => {
  let (modalState, setModalState, closeModal) = React.useContext(
    BottomSheetModalContext.modalContext,
  )
  let setSafetyStage = SafetyHook.safetyHook(navigation, rideFlowState.rideDetail)

  let translateY2 = Reanimated.useSharedValue(100.)

  let animatedStyle2 = Reanimated.useAnimatedStyle(() => {
    viewStyle(
      ~transform=[
        {
          ReactNative.Style.translateY(~translateY=translateY2.value)
        },
      ],
      (),
    )
  })

  let callDriverPopUp = {
    <CallDriverPopUp
      callDriverData={
        anonymousNmmber: switch rideFlowState.rideDetail {
        | Some(a) => Some(a.merchantExoPhone)
        | None => None
        },
        driectCallNumber: switch rideFlowState.rideDetail {
        | Some(a) => a.driverDetail.phoneNumber
        | None => None
        },
        onClosePress: closeModal,
      }
    />
  }

  let onPressCallDriver = {
    _ => {
      setModalState({
        ...modalState,
        modalComponent: Some(callDriverPopUp),
        backgroundClick: () => closeModal(),
      })
    }
  }

  React.useEffect0(() => {
    translateY2.value = Reanimated.withTiming(~toValue=0.0, ~userOption={duration: 700.})
    None
  })

  switch rideFlowState.rideDetail {
  | Some(rideDetailData) => {
      let estimatedDuration =
        rideDetailData.estimatedDuration
        ->Option.map(time => time)
        ->Option.getOr(0)

      let rideScheduledTime: string =
        rideDetailData.rideScheduledTime
        ->Option.map(time => time)
        ->Option.getOr("")

      let rideStartTime =
        rideDetailData.rideStartTime
        ->Option.map(time => time)
        ->Option.getOr("")

      let finalrideScheduledTime =
        rideDetailData.rideStatus == INPROGRESS ? rideStartTime : rideScheduledTime

      let rideStartTimeDajJs = getDayJsForString(finalrideScheduledTime)
      let ridePickupTime = rideStartTimeDajJs.format("h:mm A")
      let rideDestinationTime = rideStartTimeDajJs.add(estimatedDuration, "s").format("h:mm A")
      let sourceLocationInfo: addressCardData = {
        primaryAddress: rideDetailData.sourceLocationInfo.ward,
        secondaryAddress: rideDetailData.sourceLocationInfo.address,
        heading: {GetLocale.getLocale(PICKUP).text},
        description: ridePickupTime,
      }
      let destinationLocationInfo: addressCardData = {
        primaryAddress: rideDetailData.destinationLocationInfo.ward,
        secondaryAddress: rideDetailData.destinationLocationInfo.address,
        heading: {GetLocale.getLocale(DESTINATION).text},
        description: rideDestinationTime,
      }

      <View
        style={viewStyle(
          ~backgroundColor=ThemebasedStyle.colorString.fillPrimaryMid,
          ~borderTopEndRadius=20.,
          ~borderTopLeftRadius=20.,
          ~paddingLeft=16.->dp,
          ~paddingRight=16.->dp,
          ~height=100.->pct,
          (),
        )}>
        <View>
          <View style={viewStyle(~width=100.->pct, ())}>
            <View
              style={viewStyle(
                ~width=100.->pct,
                ~flexDirection=#row,
                ~justifyContent=#center,
                ~marginTop=20.->dp,
                ~marginBottom=15.->dp,
                ~marginRight=16.->dp,
                (),
              )}>
              <View style={viewStyle(~flex=0.3, ())} />
              <View>
                <TouchableOpacity
                  onPress={_ => setSafetyStage(_ => Some(SafetyType.SafetyOptions))}>
                  <View
                    style={viewStyle(
                      ~flexDirection=#column,
                      ~padding=0.->dp,
                      ~gap=10.,
                      ~alignItems=#center,
                      ~justifyContent=#center,
                      (),
                    )}>
                    <Svg.SvgXml xml=SafetyTools.svg />
                    <TextWrapper
                      color=ThemebasedStyle.colorClass.textBlack
                      text={SAFETY_TOOLS}
                      textType={Body_600}
                    />
                  </View>
                </TouchableOpacity>
              </View>
              <View style={viewStyle(~flex=1., ())} />
              <View>
                <TouchableOpacity onPress={_ => shareRide(rideDetailData)}>
                  <View
                    style={viewStyle(
                      ~flexDirection=#column,
                      ~padding=0.->dp,
                      ~gap=10.,
                      ~alignItems=#center,
                      ~justifyContent=#center,
                      (),
                    )}>
                    <Svg.SvgXml xml=ShareRide.svg />
                    <TextWrapper
                      color=ThemebasedStyle.colorClass.textBlack
                      text={SHARE_RIDE}
                      textType={Body_600}
                    />
                  </View>
                </TouchableOpacity>
              </View>
              <View style={viewStyle(~flex=1., ())} />
              <View style={viewStyle(~marginRight=11.->dp, ())}>
                <TouchableOpacity onPress=onPressCallDriver>
                  <View
                    style={viewStyle(
                      ~flexDirection=#column,
                      ~padding=0.->dp,
                      ~gap=10.,
                      ~alignItems=#center,
                      ~justifyContent=#center,
                      (),
                    )}>
                    <Svg.SvgXml xml=Contacts.svg />
                    <TextWrapper
                      color=ThemebasedStyle.colorClass.textBlack text={CONTACT} textType={Body_600}
                    />
                  </View>
                </TouchableOpacity>
              </View>
              <View style={viewStyle(~flex=0.3, ())} />
            </View>
          </View>
          <Seperator color=ThemebasedStyle.colorString.fillNeutralMid margin=5.0 />
          <View
            style={viewStyle(
              ~flexDirection=#row,
              ~justifyContent=#"space-between",
              ~marginTop=13.->dp,
              ~marginBottom=12.->dp,
              (),
            )}>
            <View>
              <EstimateCard
                currency=rideDetailData.currency
                amount=rideDetailData.estimatedTotalFare
                paymentDetails=rideDetailData.paymentDetails
              />
            </View>
          </View>
          <Seperator color=ThemebasedStyle.colorString.fillNeutralMid margin=5.0 />
          <Space />
          <View style={viewStyle(~width=100.0->pct, ~flexDirection=#column, ())}>
            <View
              style={viewStyle(
                ~width=100.0->pct,
                ~flexDirection=#row,
                ~paddingBottom=10.0->dp,
                ~justifyContent=#"space-between",
                ~alignItems=#center,
                (),
              )}>
              <TextWrapper text={TRIP_DETAILS} textType={Body_700} />
            </View>
            <AddressCardList details=[sourceLocationInfo, destinationLocationInfo] />
          </View>
          <Seperator color=ThemebasedStyle.colorString.fillNeutralMid margin=20.0 />
          {switch rideFlowState.stage {
          | RideAssigned =>
            <TouchableOpacity onPress={_ => setCancelRideStage(_ => Some(CancelConfirmation))}>
              <View
                style={viewStyle(
                  ~flexDirection=#row,
                  ~alignItems=#center,
                  ~justifyContent=#center,
                  ~marginBottom=15.->dp,
                  ~gap=7.,
                  (),
                )}>
                <Svg.SvgXml xml=Cancel.svg />
                <TextWrapper text={CANCEL_RIDE} textType={SBody_700} />
              </View>
            </TouchableOpacity>
          | _ => React.null
          }}
        </View>
      </View>
    }
  | None =>
    <Reanimated.ReanimatedView
      style={array([
        animatedStyle2,
        viewStyle(
          ~backgroundColor=ThemebasedStyle.colorString.fillPrimaryMid,
          ~borderTopEndRadius=20.,
          ~borderTopLeftRadius=20.,
          ~padding=16.->dp,
          (),
        ),
      ])}>
      <View style={viewStyle(~width=100.->pct, ())}>
        <View
          style={viewStyle(
            ~width=100.->pct,
            ~flexDirection=#row,
            ~justifyContent=#"space-between",
            ~padding=10.->dp,
            (),
          )}>
          <View>
            <TouchableOpacity onPress={_ => ()}>
              <View
                style={viewStyle(
                  ~flexDirection=#column,
                  ~padding=0.->dp,
                  ~gap=10.,
                  ~alignItems=#center,
                  ~justifyContent=#center,
                  (),
                )}>
                <Svg.SvgXml xml=SafetyTools.svg />
                <TextWrapper text={SAFETY_TOOLS} textType={Body_600} />
              </View>
            </TouchableOpacity>
          </View>
          <View>
            <TouchableOpacity onPress={_ => ()}>
              <View
                style={viewStyle(
                  ~flexDirection=#column,
                  ~padding=0.->dp,
                  ~gap=10.,
                  ~alignItems=#center,
                  ~justifyContent=#center,
                  (),
                )}>
                <Svg.SvgXml xml=ShareRide.svg />
                <TextWrapper text={SHARE_RIDE} textType={Body_600} />
              </View>
            </TouchableOpacity>
          </View>
          <View>
            <TouchableOpacity>
              <View
                style={viewStyle(
                  ~flexDirection=#column,
                  ~padding=0.->dp,
                  ~gap=10.,
                  ~alignItems=#center,
                  ~justifyContent=#center,
                  (),
                )}>
                <Svg.SvgXml xml=Contacts.svg />
                <TextWrapper text={CONTACT} textType={Body_600} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <Seperator color=ThemebasedStyle.colorString.fillNeutralMid margin=5.0 />
      </View>
      <Space />
    </Reanimated.ReanimatedView>
  }
}
