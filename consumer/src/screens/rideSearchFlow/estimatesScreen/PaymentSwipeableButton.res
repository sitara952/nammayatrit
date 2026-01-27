open ReactNative
open Style
open ReactNavigation
open PaymentCardBrandLogo
open DayJs

module PaymentSelector = {
  @react.component
  let make = (
    ~optSelectedCard: option<Payment.customerCard>,
    ~onAddCard,
    ~onManagePaymentMethod,
    ~isEnabled=true,
  ) => {
    if Option.isSome(optSelectedCard) {
      let selectedCard: Payment.customerCard = optSelectedCard->Option.getExn
      <TouchableOpacity
        style={viewStyle(~flexDirection=#row, ~justifyContent=#center, ())}
        onPress={_ => onManagePaymentMethod()}>
        <View style={viewStyle()}>
          <PaymentCardBrandLogo cardBrand=selectedCard.brand height={30.->dp} width={30.->dp} />
        </View>
        <View style={viewStyle(~paddingLeft=6.->dp, ~justifyContent=#center, ())}>
          <TextWrapper
            text=CUSTOM_TEXT({
              text: selectedCard.last4->Int.toString,
              accessibilityHintOverride: "Card last 4 digits " ++ selectedCard.last4->Int.toString,
            })
            textType={SBody_700}
          />
        </View>
        <View style={viewStyle(~justifyContent=#center, ~paddingLeft=4.->dp, ())}>
          <View style={viewStyle(~transform=[ReactNative.Style.rotateZ(~rotateZ=270.->deg)], ())}>
            <Svg.SvgXml xml=Back.svg width="14" height="14" />
          </View>
        </View>
      </TouchableOpacity>
    } else {
      <TouchableOpacity style={viewStyle()} onPress={onAddCard} disabled={!isEnabled}>
        <TextWrapper text={ADD_CARD} textType={SBody_700} />
      </TouchableOpacity>
    }
  }
}

@react.component
let make = (~navigation, ~footerHeight, ~setFooterHeight) => {
  let (rideSearchContext, setRideSearchState) = React.useContext(
    RideSearchContext.rideSearchContext,
  )
  let (_, rideFlowAction) = React.useContext(RideFlowContext.context)
  let onSucess = _ => {
    rideFlowAction(RideFlowContext.UpdateStage(RideFlowContext.FindingRides))
  }
  let (_, _, selectEstimateApi) = UseEstimateSelection.useEstimateSelection(
    rideSearchContext.estimateList,
    onSucess,
  )
  let (_, setIsLoading) = React.useState(() => false)

  let (isSwipeableButtonLoading, setIsSwipeableButtonLoading) = React.useState(() => false)

  let (_, setIsPaymentLoading) = React.useState(() => true)
  let (isPaymentFailed, setIsPaymentFailed) = React.useState(() => false)

  let {
    paymentMethodList,
    defaultPaymentMethod,
    initPaymentSheet,
    handleAddCard,
    isAddCardEnabled,
    updatePaymentMethods,
  } = PaymentHook.usePayments()

  let handleAddCardWithErrorHandling = () => {
    handleAddCard()
    ->Promise.thenResolve(result => {
      switch result {
      | Some(_) => setIsPaymentFailed(_ => true)
      | None => ()
      }
    })
    ->ignore
  }

  React.useEffect(() => {
    updatePaymentMethods()
    ->Promise.thenResolve(_ => {
      setIsPaymentLoading(_ => false)
      if Array.length(paymentMethodList) == 0 {
        initPaymentSheet()->ignore
      }
    })
    ->ignore
    None
  }, [])

  let continueToFindRides = selectedPaymentId => {
    selectEstimateApi(setIsLoading, selectedPaymentId)
    rideFlowAction(RideFlowContext.UpdateStage(RideFlowContext.FindingRides))
  }

  let handleButtonSwipe = () => {
    // Check if user has set default payment method

    let currentTime = getDayJs()
    let searchExpiryTime = getDayJsForString(rideSearchContext.validTill)
    let diff = searchExpiryTime.diff(currentTime, "s")
    if diff > 0 {
      if defaultPaymentMethod->Option.isNone {
        handleAddCard()
        ->Promise.thenResolve(_ => {
          updatePaymentMethods()->Promise.thenResolve(_ => {
            if defaultPaymentMethod->Option.isSome {
              let selectedPaymentMethod' = Option.getExn(defaultPaymentMethod) // Safe to unwrap
              let selectedPaymentId = selectedPaymentMethod'.cardId
              continueToFindRides(selectedPaymentId)
            } else {
              Console.log("Payment method should be selected before booking ride")
              setIsPaymentFailed(_ => true)
              setIsSwipeableButtonLoading(_ => false)
            }
          })
        })
        ->ignore
      } else {
        let selectedPaymentMethod' = Option.getExn(defaultPaymentMethod) // Safe to unwrap
        let selectedPaymentId = selectedPaymentMethod'.cardId
        continueToFindRides(selectedPaymentId)
      }
    } else {
      ToastWrapper.myToast(
        ~message=ESTIMATES_HAS_BEEN_EXPIRED,
        ~duration=5000,
        ~position=2,
        ~leftIcon=NoIcon,
      )
      setRideSearchState({
        ...rideSearchContext,
        validTill: "",
      })
    }
  }

  let isEstimateListEmpty = switch rideSearchContext.estimateList {
  | [] => true
  | _ => false
  }

  <View
    style={viewStyle(
      ~position=#absolute,
      ~backgroundColor=ThemebasedStyle.colorString.borderNeutralMid,
      ~bottom=0.->dp,
      ~width=100.->pct,
      (),
    )}
    onLayout={(event: Event.layoutEvent) => {
      let nativeEvent = Event.LayoutEvent.nativeEvent(event)
      let height =
        nativeEvent
        ->JSON.Decode.object
        ->Option.getOr(Dict.make())
        ->Dict.get("layout")
        ->Option.getOr(JSON.Encode.null)
        ->JSON.Decode.object
        ->Option.getOr(Dict.make())
        ->Dict.get("height")
        ->Option.getOr(JSON.Encode.null)
        ->JSON.Decode.float
        ->Option.getOr(0.)
      if height > footerHeight {
        setFooterHeight(_ => height)
      }
    }}>
    <View
      style={viewStyle(
        ~flexDirection=#column,
        ~backgroundColor=ThemebasedStyle.colorString.borderNeutralMid,
        ~alignContent=#center,
        ~height=1.->dp,
        ~width=100.->pct,
        (),
      )}
    />
    <View
      style={viewStyle(
        ~flexDirection=#column,
        ~backgroundColor=ThemebasedStyle.colorString.fillNeutralWhite,
        ~paddingBottom=20.->dp,
        ~paddingTop=14.->dp,
        ~paddingHorizontal=20.->dp,
        ~alignContent=#center,
        (),
      )}>
      {isEstimateListEmpty
        ? <PaymentMethodShimmer loading=true />
        : <View
            style={viewStyle(
              ~flexDirection=#row,
              ~backgroundColor=ThemebasedStyle.colorString.fillNeutralWhite,
              ~marginBottom=12.->dp,
              ~justifyContent=#"space-between",
              ~alignItems=#center,
              (),
            )}>
            <TextWrapper
              text={PAY_BY} color=ThemebasedStyle.colorClass.textMid textType={Body_700}
            />
            <PaymentSelector
              optSelectedCard={defaultPaymentMethod}
              isEnabled={isAddCardEnabled}
              onAddCard={_ => handleAddCardWithErrorHandling()}
              onManagePaymentMethod={_ =>
                Core.Navigation.navigate(navigation, AppRoutes.navigationRouts.paymentMethods)}
            />
          </View>}
      <SwipeableButton
        isLoading={isSwipeableButtonLoading}
        onSwipeComplete={handleButtonSwipe}
        isPaymentFailed
        setIsPaymentFailed
        backgroundColorSwipView=ThemebasedStyle.colorString.fillPrimaryHigh
      />
    </View>
  </View>
}
