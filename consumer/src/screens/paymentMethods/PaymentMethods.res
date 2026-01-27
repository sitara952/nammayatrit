open ReactNavigation
open ReactNative
open Style
open Reanimated
open Tailwind
open PaymentCardBrandLogo

// TODO: Can be removed once merged, because these Icons are added from Favourite screen PR
module ArrowLeft = {
  @react.component
  let make = (~fill="#161721") => {
    <Svg width="100%" height="100%" viewBox="0 0 48 24" fill="none">
      <Svg.G clipPath="url(#clip0_630_9463)">
        <Svg.Path d="M3.58839 13.0443H20.4004V10.9443H3.58839V13.0443Z" fill={fill} />
        <Svg.Path
          d="M9.34794 3.58827L10.8359 5.07627L4.51194 11.4003V12.5883L10.8359 18.9123L9.34794 20.4003L2.41194 13.4643V10.5363L9.34794 3.58827Z"
          fill={fill}
        />
      </Svg.G>
      <Svg.Defs>
        <Svg.ClipPath id="clip0_630_9463">
          <Svg.Rect
            width="17.988"
            height="16.812"
            fill="white"
            transform="matrix(-1 0 0 -1 20.4004 20.4003)"
          />
        </Svg.ClipPath>
      </Svg.Defs>
    </Svg>
  }
}

module AddIcon = {
  @react.component
  let make = (~fill="black") => {
    <Svg width="100%" height="100%" viewBox="0 0 20 20" fill="none">
      <Svg.Path d="M16.0039 9L16.0039 10.75L4.00391 10.75L4.00391 9L16.0039 9Z" fill={fill} />
      <Svg.Path
        d="M10.8789 15.875L9.12891 15.875L9.12891 3.875L10.8789 3.875L10.8789 15.875Z" fill={fill}
      />
    </Svg>
  }
}

module TickIcon = {
  @react.component
  let make = (~fill="#161721") => {
    <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <Svg.G clipPath="url(#clip0_376_8141)">
        <Svg.Path
          d="M8.0673 16H6.90997L6.62875 15.6323C6.62875 15.6323 4.81164 13.3176 1.79395 11.0787L2.91882 9.55359C5.29837 11.3166 6.94242 13.0796 7.68873 13.9449C8.75953 12.4523 11.8854 8.42871 16.6769 5L17.7802 6.53589C12.1991 10.5379 8.90014 15.5241 8.86769 15.5782L8.58647 16.0108H8.07811L8.0673 16Z"
          fill={fill}
        />
      </Svg.G>
      <Svg.Defs>
        <Svg.ClipPath id="clip0_376_8141">
          <Svg.Rect width="15.9862" height="11" fill="white" transform="translate(1.79395 5)" />
        </Svg.ClipPath>
      </Svg.Defs>
    </Svg>
  }
}

module AddCard = {
  @react.component
  let make = (~isEnabled=true, ~setIsEnabled, ~onAddCard: unit => unit) => {
    <ReanimatedView
      style={array([tw("pt-3 pb-6 px-4 bg-white overflow-visible ")])} entering=Reanimated.fadeIn>
      <Pressable
        disabled={!isEnabled}
        onPress={_ => onAddCard()}
        onPressIn={_ => setIsEnabled(_ => false)}
        style={interactionState =>
          array([
            tw(
              "py-4 border-[1px] border-[#EBEBEE] rounded-[14px] bg-white flex flex-row items-center pl-3 pr-4",
            ),
            interactionState.pressed ? tw("bg-[#F1F2F7]") : tw(""),
          ])}>
        {_interactionState => <>
          <ReanimatedView style={tw("h-12 w-12 justify-center items-center")}>
            <IconWrapper icon={() => <AddIcon fill="#413F42" />} size="h-8" />
          </ReanimatedView>
          <ReanimatedView style={tw("pl-2.5")}>
            <AnimatedText style={tw("text-[15px] font-bold leading-[18px] text-[#2E2C2F]")}>
              {React.string("Add New Card")}
            </AnimatedText>
            <AnimatedText style={tw("text-[13px] font-bold leading-[15px] text-[#878389] pt-2")}>
              {React.string("Save and Pay via Cards")}
            </AnimatedText>
          </ReanimatedView>
        </>}
      </Pressable>
    </ReanimatedView>
  }
}

module RadioButton = {
  @react.component
  let make = (~isSelected=false, ~onPress: ReactNative.Event.pressEvent => unit, ~children) => {
    <TouchableOpacity
      onPress={onPress}
      style={viewStyle(
        ~flexDirection=#row,
        ~alignContent=#center,
        ~alignItems=#center,
        ~flexGrow=1.,
        (),
      )}>
      <View
        style={viewStyle(
          ~height=16.->dp,
          ~width=16.->dp,
          ~backgroundColor="#F8F8F8",
          ~borderRadius=10.,
          ~borderWidth=1.,
          ~borderColor={
            if isSelected {
              "#14171F"
            } else {
              "#CCCCCC"
            }
          },
          ~justifyContent=#center,
          ~alignItems=#center,
          (),
        )}>
        {if isSelected {
          <View
            style={viewStyle(
              ~height=10.->dp,
              ~width=10.->dp,
              ~borderRadius=7.,
              ~backgroundColor="#2B2E3B",
              (),
            )}
          />
        } else {
          <View />
        }}
      </View>
      {children}
    </TouchableOpacity>
  }
}

module PaymentCard = {
  @react.component
  let make = (
    ~isSelected=false,
    ~onSelect: unit => unit,
    ~cardBrand: string,
    ~last4Digits: int,
    ~index: float,
  ) => {
    <ReanimatedView
      style={array([tw("pt-3 px-4"), index == 0. ? tw("pt-0") : tw("")])}
      entering=Reanimated.fadeIn>
      <Pressable
        onPress={_ => onSelect()}
        style={interactionState =>
          array([
            tw(
              "py-4 border-[1px] border-[#EBEBEE] rounded-[14px] bg-white flex flex-row items-center pl-3 pr-4",
            ),
            interactionState.pressed ? tw("bg-[#F1F2F7]") : tw(""),
            isSelected ? tw("border-[#E6E2FF]") : tw(""),
          ])}>
        {_interactionState =>
          <ReanimatedView style={tw("flex flex-row items-center justify-between w-full")}>
            <ReanimatedView style={tw("flex-row items-center")}>
              <ReanimatedView style={tw("h-12 w-12 justify-center items-center")}>
                <PaymentCardBrandLogo cardBrand height={24.->dp} />
              </ReanimatedView>
              <ReanimatedView style={tw("pl-2.5")}>
                <AnimatedText
                  style={tw("text-[15px] font-bold leading-[18px] text-[#2E2C2F] uppercase")}>
                  {React.string(cardBrand)}
                </AnimatedText>
                <AnimatedText
                  style={tw("text-[13px] font-bold leading-[15px] text-[#878389] pt-2")}>
                  {React.string("••••" ++ " " ++ Int.toString(last4Digits))}
                </AnimatedText>
              </ReanimatedView>
            </ReanimatedView>
            {isSelected
              ? <IconWrapper icon={() => <TickIcon fill="#7D4BFF" />} size="h-5" />
              : React.null}
          </ReanimatedView>}
      </Pressable>
    </ReanimatedView>
  }
}

module NoPaymentMethod = {
  @react.component
  let make = (~isAddCardEnabled, ~setIsAddCardEnabled, ~onAddCard) => {
    <ReanimatedView>
      <ReanimatedView style={tw("pt-5 px-4")} entering=Reanimated.fadeIn>
        <Pressable
          disabled={!isAddCardEnabled}
          onPress={onAddCard}
          onPressIn={_ => setIsAddCardEnabled(_ => false)}
          style={interactionState =>
            array([
              tw(
                "py-4 border-[1px] border-[#EBEBEE] rounded-[14px] bg-white flex flex-row items-center pl-3 pr-4",
              ),
              interactionState.pressed ? tw("bg-[#F1F2F7]") : tw(""),
            ])}>
          {_interactionState => <>
            <ReanimatedView style={tw("h-12 w-12 justify-center items-center")}>
              <IconWrapper icon={() => <AddIcon fill="#413F42" />} size="h-8" />
            </ReanimatedView>
            <ReanimatedView style={tw("pl-2.5")}>
              <AnimatedText style={tw("text-[15px] font-bold leading-[18px] text-[#2E2C2F]")}>
                {React.string("Add New Card")}
              </AnimatedText>
              <AnimatedText style={tw("text-[13px] font-bold leading-[15px] text-[#878389] pt-2")}>
                {React.string("Save and Pay via Cards")}
              </AnimatedText>
            </ReanimatedView>
          </>}
        </Pressable>
      </ReanimatedView>
    </ReanimatedView>
  }
}

module PaymentMethodsList = {
  @react.component
  let make = (
    ~paymentMethods: array<Payment.customerCard>,
    ~onAddCard,
    ~isAddCardEnabled,
    ~setIsAddCardEnabled,
    ~selectedPaymentMethodId: option<string>,
    ~setSelectedPaymentMethodId: string => unit,
  ) => {
    <ReanimatedView style={tw(" flex-initial bg-white")}>
      <FlatList
        data={paymentMethods}
        style={tw(" bg-white")}
        contentContainerStyle={tw("pt-4 bg-white")}
        renderItem={({item, index}) => {
          <PaymentCard
            index={Belt.Int.toFloat(index)}
            cardBrand={item.brand}
            last4Digits={item.last4}
            isSelected={selectedPaymentMethodId
            ->Option.map(cardId => cardId == item.cardId)
            ->Option.getOr(false)}
            onSelect={_ => {
              setSelectedPaymentMethodId(item.cardId)
            }}
          />
        }}
        keyExtractor={(item, _) => item.cardId}
      />
      <AddCard
        isEnabled={isAddCardEnabled} setIsEnabled={setIsAddCardEnabled} onAddCard={onAddCard}
      />
    </ReanimatedView>
  }
}

@react.component(: Core.screenProps)
let make = (~navigation: navigation, ~route as _) => {
  let (rideFlowState, _) = React.useContext(RideFlowContext.context)
  let (pageLoading, setPageLoading) = React.useState(() => true)
  let {
    paymentMethodList,
    updatePaymentMethods,
    initPaymentSheet,
    isAddCardEnabled,
    setIsAddCardEnabled,
    disableManage,
    setDisableManage,
    handleAddCard,
    defaultPaymentMethod,
    handleSetDefaultPaymentMethod,
  } = PaymentHook.usePayments()
  let handleUpdateUserProfile = selectedPaymentMethodId => {
    handleSetDefaultPaymentMethod(selectedPaymentMethodId)->ignore
  }

  let onBackPress = _ => {
    switch rideFlowState.stage {
    | ConfirmingRide(_) | RideAssigned | RideStarted =>
      Core.Navigation.navigate(navigation, AppRoutes.navigationRouts.rideTrackScreen)
    | _ => Core.Navigation.goBack(navigation, ())
    }
  }

  let handleAddCard_ = async () => {
    try {
      await initPaymentSheet()
      Console.log("Payment sheet initialized")
      await handleAddCard()
    } catch {
    | err =>
      Console.log2("Payment sheet initialize error", err)
      None
    }
  }

  React.useEffect0(() => {
    updatePaymentMethods()
    ->Promise.thenResolve(_ => {
      setPageLoading(_ => false)
    })
    ->ignore
    None
  })

  <ReanimatedView style={tw("flex-1 bg-white")}>
    <SafeAreaView />
    <Stripe.StripeProvider publishableKey={Constants.stripePublishableKey}>
      <ReanimatedView
        style={tw(
          "flex flex-row items-center justify-between px-5 h-11 border-b-[1px] border-[#0000000C]",
        )}>
        <PressableComponent
          onPress=onBackPress hitSlop={{bottom: 10., top: 10., left: 10., right: 10.}}>
          <IconWrapper icon={() => <ArrowLeft />} size="h-10" />
        </PressableComponent>
        <AnimatedText style={tw("text-base font-bold")}> {React.string("Payments")} </AnimatedText>
        <PressableComponent
          disabled={paymentMethodList->Array.length == 0 || disableManage == true}
          style={array([paymentMethodList->Array.length == 0 ? tw("opacity-0") : tw("")])}
          onPress={_ => handleAddCard_()->ignore}
          onPressIn={_ => setDisableManage(_ => true)}
          hitSlop={{bottom: 10., top: 10., left: 10., right: 10.}}>
          <AnimatedText style={tw("text-[13px] font-bold text-[#7D4BFF]")}>
            {React.string("Manage")}
          </AnimatedText>
        </PressableComponent>
      </ReanimatedView>
      {pageLoading
        ? <>
            <PaymentCardShimmer loading=pageLoading />
          </>
        : {
            if Array.length(paymentMethodList) == 0 {
              <NoPaymentMethod
                isAddCardEnabled={isAddCardEnabled}
                setIsAddCardEnabled={setIsAddCardEnabled}
                onAddCard={_ => handleAddCard_()->ignore}
              />
            } else {
              <PaymentMethodsList
                selectedPaymentMethodId={defaultPaymentMethod->Option.map(pm => pm.cardId)}
                setSelectedPaymentMethodId={handleUpdateUserProfile}
                isAddCardEnabled={isAddCardEnabled}
                setIsAddCardEnabled={setIsAddCardEnabled}
                paymentMethods={paymentMethodList}
                onAddCard={_ => handleAddCard_()->ignore}
              />
            }
          }}
    </Stripe.StripeProvider>
  </ReanimatedView>
}
