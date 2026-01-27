open ReactNative
open Style
open Tailwind
open Reanimated

module ReferralInputView = {
  @react.component
  let make = (~setIsReferralApplied) => {
    let (userProfile, updateUserProfile) = React.useContext(UserProfileContext.userProfileContext)
    let (inputValue, setInputValue) = React.useState(() => "")
    let (errorMessage, setErrorMessage) = React.useState(() => None)

    React.useEffect1(() => {
      if inputValue == "" {
        setErrorMessage(_ => None)
      }
      None
    }, [inputValue])

    let updateProfile = {
      _ => {
        updateUserProfile({
          ...userProfile,
          referralCode: Some(inputValue),
        })
      }
    }

    let handlePress = () => {
      ApiCall.callPostAPI(
        ~url=ApiRoutes.apiRoutes.getProfile,
        ~body={
          UpdateProfile.encodeUpdateProfileReq(
            UpdateProfile.mkUpdateProfileRequest(~referralCode=Some(inputValue)),
          )
        },
        ~onSuccess=resp => {
          switch resp->JSON.Decode.object {
          | Some(obj) =>
            switch obj->Dict.get("result") {
            | Some(result) => {
                setIsReferralApplied(_ => result->JSON.Decode.string)
                updateProfile()
              }
            | None =>
              switch obj->Dict.get("errorCode") {
              | Some(_) =>
                switch obj->Dict.get("errorMessage") {
                | Some(errMsg) => setErrorMessage(_ => errMsg->JSON.Decode.string)
                | None => ()
                }
              | None => ()
              }
            }

          | None => ()
          }
        },
        ~onError={
          err => {
            Console.error2("Update Profile ERROR API", err)
          }
        },
      )->ignore
    }

    <View style={tw("w-full")}>
      <CustomInput
        state=inputValue
        setState={val => {
          setInputValue(_ => val)
        }}
        placeholder={CUSTOM_TEXT({text: "------"})}
        placeholderTextColor={Some(ThemebasedStyle.colorString.fillNeutralMid)}
        textAlign={Some(#center)}
        isValid={errorMessage != None && errorMessage != Some("Success") ? false : true}
        paddingHorizontal={0.0->dp}
        paddingBottom={0.0->dp}
      />
      {errorMessage != None && errorMessage != Some("Success")
        ? <ReanimatedView entering=Reanimated.zoomIn>
            <TextWrapper
              text={INVALID_CODE}
              textType={Body_600}
              overRideStyle={tw(` text-textNegative py-2 rounded-lg text-center`)}
              color=ThemebasedStyle.colorClass.textWhite
            />
          </ReanimatedView>
        : React.null}
      <PressableComponent
        style={tw(`pt-4`)}
        onPress={_ =>
          if inputValue != "" {
            handlePress()
          }}>
        <TextWrapper
          text={APPLY}
          textType={SHead_700}
          overRideStyle={tw(
            ` ${inputValue == ""
                ? `bg-ctaSecondaryActive text-textMid`
                : `bg-ctaPrimaryActive`} rounded-lg py-4 text-center align-middle`,
          )}
          color=ThemebasedStyle.colorClass.textWhite
        />
      </PressableComponent>
    </View>
  }
}

module ReferralInfo = {
  @react.component
  let make = (~enableCloseModal=false, ~setShowReferralInfo=_ => (), ~closeModal=_ => ()) => {
    let (appName, setAppName) = React.useState(() => "")
    React.useEffect0(() => {
      AppInfoModule.getName(~setAppName)->ignore
      None
    })
    <PopUpModal
      popUpModalType=PopUpModal.PopUp1({
        title: WHAT_IS_THE_REFERRAL_PROGRAM,
        onClose: None,
        primaryText: THE_REFERRAL_PROGRAM_INCENTIVISES(appName),
        button1: None,
        button2: Some({
          text: GOT_IT,
          onPress: {_ => enableCloseModal ? closeModal() : setShowReferralInfo(_ => false)},
        }),
      })
    />
  }
}

@react.component
let make = (~closeModal, ~setIsReferralApplied) => {
  let (showReferralInfo, setShowReferralInfo) = React.useState(() => false)

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

  {
    showReferralInfo
      ? <ReferralInfo setShowReferralInfo />
      : <ReanimatedView style={array([tw(" bg-white rounded-t-2xl px-5 py-4"), animatedStyle])}>
          <View style={tw("flex-col items-center justify-between")}>
            <View style={tw("w-[350px] flex-row justify-between items-center")}>
              <View style={tw(" flex-row items-center")}>
                <TextWrapper
                  textType={Head_800} text={HAVE_A_REFERRAL_CODE} overRideStyle={tw("mr-3")}
                />
                <PressableComponent onPress={_ => setShowReferralInfo(_ => true)}>
                  <Svg.SvgXml
                    xml={InfoIcon.svg(~color={ThemebasedStyle.colorString.fillPrimaryHigh})}
                  />
                </PressableComponent>
              </View>
              <PressableComponent onPress={_ => closeModal()}>
                <Svg.SvgXml xml={Close.svg("white")} />
              </PressableComponent>
            </View>
            <View style={tw("h-[200px] px-4")}>
              <Image
                source={Image.Source.fromRequired(
                  Packager.require("../resources/assets/png/referral_image.png"),
                )}
                style={imageStyle(
                  ~resizeMode=#contain,
                  ~height=150.->dp,
                  ~width=280.->dp,
                  ~marginBottom=16.->dp,
                  (),
                )}
              />
              <TextWrapper
                textType={Body_600}
                text={ENTER_REFERRAL_CODE_BELOW}
                overRideStyle={textStyle(~alignSelf=#center, ())}
              />
            </View>
            <View>
              <ReferralInputView setIsReferralApplied />
              <PressableComponent
                style={tw(`pt-2.5`)}
                onPress={_ => {
                  closeModal()
                }}>
                <TextWrapper
                  text={SKIP}
                  textType={SHead_700}
                  overRideStyle={tw(` text-textBlack py-4 text-center align-middle`)}
                  color=ThemebasedStyle.colorClass.textWhite
                />
              </PressableComponent>
            </View>
          </View>
        </ReanimatedView>
  }
}
