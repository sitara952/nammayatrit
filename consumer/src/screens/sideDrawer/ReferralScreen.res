open ReactNavigation
open ReactNative
open Style
open Tailwind
open QRCode
open ReactNative.Share

module ReferredUsers = {
  @react.component
  let make = (~appName, ~closeModal) => {
    <PopUpModal
      popUpModalType=PopUpModal.PopUp1({
        title: REFERRED_USERS,
        onClose: None,
        primaryText: USERS_WHO_DOWNLOAD_THE_APP(appName),
        button1: None,
        button2: Some({
          text: GOT_IT,
          onPress: {_ => closeModal()},
        }),
      })
    />
  }
}

module ApplyReferralView = {
  @react.component
  let make = (~setIsReferralApplied) => {
    let (modal, setModal, closeModal) = React.useContext(BottomSheetModalContext.modalContext)
    <View>
      <View style={tw(" flex-row items-center mb-2")}>
        <TextWrapper textType={Body_600} text={HAVE_A_REFERRAL_CODE} overRideStyle={tw("mr-3")} />
        <PressableComponent
          onPress={_ =>
            setModal({
              ...modal,
              modalComponent: Some(<ReferralPopUp.ReferralInfo enableCloseModal=true closeModal />),
            })}>
          <Svg.SvgXml xml={InfoIcon.svg(~color="#14171F")} />
        </PressableComponent>
      </View>
      <ReferralPopUp.ReferralInputView setIsReferralApplied />
    </View>
  }
}

@react.component(: Core.screenProps)
let make = (~navigation, ~route as _) => {
  let (rideFlowState, _) = React.useContext(RideFlowContext.context)
  let (userProfile, _) = React.useContext(UserProfileContext.userProfileContext)
  let (isReferralApplied, setIsReferralApplied) = React.useState(() => None)
  let (appName, setAppName) = React.useState(() => "")
  let toastcontext = React.useContext(ToastContext.context)
  let referralLink = Common.generateReferralLink(
    "qrcode",
    "referral",
    "refer",
    userProfile.customerReferralCode->Option.getOr(""),
  )

  let referralCode = userProfile.customerReferralCode->Option.getOr("")
  let (copiedText, _) = React.useState(_ => referralCode)

  let onBackPress = _ => {
    switch rideFlowState.stage {
    | ConfirmingRide(_) | RideAssigned | RideStarted =>
      Core.Navigation.navigate(navigation, AppRoutes.navigationRouts.rideTrackScreen)
    | _ => Core.Navigation.goBack(navigation, ())
    }
  }

  let shareRide = () => {
    let shareContent = async (~message: string, ~url: string) => {
      let content: Share.content = {
        title: "Share App",
        message,
        url,
      }
      let options: Share.options = {
        dialogTitle: "Share & Refer",
        subject: "Share & Refer",
      }
      let _shareAction = await Share.shareWithOptions(content, options)
    }
    let message = `Hey! Download this amazing new ${appName} app that charges zero commission! 🚗💨 Use my referral code ${referralCode} to sign up and enjoy affordable rides. Download the app now: ${referralLink}`
    shareContent(~message, ~url=referralLink)->ignore
  }

  let keyboard = Reanimated.useAnimatedKeyboard()
  let animatedStyle = Reanimated.useAnimatedStyle(() => {
    viewStyle(
      ~transform=[
        {
          ReactNative.Style.translateY(
            ~translateY=Belt.Int.toFloat(-Belt.Float.toInt(keyboard.height.value)),
          )
        },
      ],
      (),
    )
  })

  React.useEffect0(() => {
    AppInfoModule.getName(~setAppName)->ignore
    None
  })

  React.useEffect1(() => {
    if isReferralApplied != None && isReferralApplied == Some("Success") {
      Core.Navigation.navigate(navigation, AppRoutes.navigationRouts.homeScreen)
      toastcontext.updateProperties(~extraInsets={top: 0, bottom: 310, right: 10, left: 0})
      ToastWrapper.myToast(
        ~message={REFERRAL_CODE_APPLIED_SUCCESSFULLY},
        ~duration=3000,
        ~position=Toast.toInt(BOTTOM),
        ~animationConfig={
          flingPositionReturnDuration: 10,
          animationStiffness: 100,
          animationDuration: 1000,
        },
      )
    }
    setIsReferralApplied(_ => None)
    None
  }, [isReferralApplied])

  <Reanimated.ReanimatedView>
    <HeaderWithSafeArea title=REFER_YOUR_FRIENDS onBackPress backgroundColor={"bg-white"} />
    <Reanimated.ReanimatedView style={array([tw(`h-full bg-fillNeutralWhite `)])}>
      <Reanimated.ScrollView style={array([tw(` px-4 py-5`)])}>
        <Reanimated.ReanimatedView style={array([animatedStyle])}>
          <View
            style={tw(`flex-col justify-around items-center border-[1px] rounded-2xl border-borderNeutralMid mb-[40px]`)}>
            <View style={tw(`py-4 px-[57]`)}>
              <QRCode
                value={referralLink}
                size=200
                color={"black"}
                logo={Image.Source.fromRequired(
                  Packager.require("../../typescript/assets/ny-service/mt_ic_logo.png"),
                )}
                backgroundColor={"white"}
                logoSize=50
                logoMargin=2
                logoBackgroundColor={"white"}
                logoBorderRadius=16
                ecl={#H}
              />
            </View>
            <View style={tw("h-[92px] px-3 flex-col justify-between items-center")}>
              <View style={tw("flex-col items-center")}>
                <TextWrapper textType={SBody_600} text={YOUR_REFERRAL_CODE} />
                <TouchableOpacity onPress={_ => ClipboardModule.copyToClipboard(~text=copiedText)}>
                  <View style={tw(" flex-row justify-center items-center ")}>
                    <TextWrapper
                      text={CUSTOM_TEXT({
                        text: userProfile.customerReferralCode->Option.getOr("-"),
                      })}
                      textType={Title_900}
                      overRideStyle={tw("mr-[3px]")}
                    />
                    <Svg.SvgXml xml=CopyContent.svg width="20" height="20" />
                  </View>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={_ => {
                  shareRide()
                }}>
                <View
                  style={array([
                    {
                      tw(`flex-row justify-between items-center px-3 py-1.5 mb-2 rounded-full border-[1px]  border-borderNeutralMid bg-fillNeutralLow  `)
                    },
                  ])}>
                  <Svg.SvgXml xml=ShareIcon.svg width="20" height="20" />
                  <TextWrapper
                    textType={SBody_600} text={SHARE_AND_REFER} overRideStyle={tw(" pl-[2px]")}
                  />
                </View>
              </TouchableOpacity>
            </View>

            // -------- Referred Users View TODO: Referred Users value not getting from backend ---------
            // <View style={tw(`border-t-[1px] mx-5 my-4 border-borderNeutralMid`)}>
            //   <View style={tw(` w-full flex-row justify-between items-center mt-3`)}>
            //     <View style={tw("flex-row items-center")}>
            //       <Svg.SvgXml xml=DoubleStarIcon.svg />
            //       <TextWrapper
            //         textType={SBody_600} text={REFERRED_USERS} overRideStyle={tw(" px-1")}
            //       />
            //       <PressableComponent
            //         onPress={_ =>
            //           setModal({
            //             ...modal,
            //             modalComponent: Some(<ReferredUsers appName closeModal />),
            //           })}>
            //         <Svg.SvgXml height="23" xml={InfoIcon.svg(~color="#14171F")} />
            //       </PressableComponent>
            //     </View>
            //     <TextWrapper
            //       text={CUSTOM_TEXT({text: "0"})} textType={SBody_600} overRideStyle={tw(" px-1")}
            //     />
            //   </View>
            // </View>
          </View>
          {userProfile.referralCode == None
            ? <Reanimated.ReanimatedView>
                <ApplyReferralView setIsReferralApplied />
              </Reanimated.ReanimatedView>
            : React.null}
        </Reanimated.ReanimatedView>
      </Reanimated.ScrollView>
    </Reanimated.ReanimatedView>
  </Reanimated.ReanimatedView>
}
