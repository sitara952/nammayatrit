open ReactNavigation
open ReactNative
open Tailwind
open Contact
open Style
open EmergencyContacts
open! Reanimated

let getShareRideOption = (
  shareRideType: EmergencyContacts.shareTripOption,
): LocaleStringType.localeString => {
  switch shareRideType {
  | ALWAYS_SHARE => ALL_RIDES_SHARED_AUTOMATICALLY
  | SHARE_WITH_TIME_CONSTRAINTS => NIGHT_RIDES_SHARED_AUTOMATICALLY
  | NEVER_SHARE => I_WILL_SHARE_RIDES_MANUALLY
  }
}

let shareRideOptions: array<EmergencyContacts.shareTripOption> = [
  ALWAYS_SHARE,
  SHARE_WITH_TIME_CONSTRAINTS,
  NEVER_SHARE,
]

@react.component(: Core.screenProps)
let make = (~navigation, ~route as _) => {
  let (showShareRideOptions, setShareRideOptionsVisibility) = React.useState(_ => None)
  let shadowStyle = ShadowHook.useGetShadowStyle(~shadowIntensity=2., ~elevation=10., ())
  let (safetyContext, setSafetyContext) = React.useContext(SafetyFlowContext.safetyContext)
  let shareRideOptionModified = React.useRef(false)
  let emergencyContacts: array<EmergencyContacts.contactDetails> = switch safetyContext {
  | Some(emergencySetting) => emergencySetting.defaultEmergencyNumbers
  | None => []
  }

  let updateEmergencyContacts = modifiedEmergencyContact => {
    ApiCall.callPostAPI(
      ~url=ApiRoutes.apiRoutes.emergencyContacts,
      ~body=modifiedEmergencyContact->EmergencyContacts.decodeContactDetails,
      ~onSuccess={
        _ => {
          switch safetyContext {
          | Some(emergencySetting) =>
            setSafetyContext(
              Some({...emergencySetting, defaultEmergencyNumbers: modifiedEmergencyContact}),
            )
          | None => ()
          }
        }
      },
      ~onError={
        err => {
          Console.error2("updateEmergencyContacts ERROR API", err)
        }
      },
    )->ignore
  }

  let getEmergencySettings = () => {
    ApiCall.callGetAPI(
      ~url=ApiRoutes.apiRoutes.getEmergencySettings,
      ~onSuccess=resp => {
        switch resp->JSON.Decode.object {
        | Some(obj) => {
            let emergencySettingResp = EmergencySettings.decodeEmergencySettingsReq(obj)
            setSafetyContext(emergencySettingResp)
          }
        | None => ()
        }
      },
      ~onError=_ => {
        Console.warn("getEmergencySettings API ERROR")
      },
    )->ignore
  }

  let navigateToSelectContactScreen = () => {
    Core.Navigation.navigateWithParams(
      navigation,
      AppRoutes.navigationRouts.selectContact,
      {
        "screen": AppRoutes.navigationRouts.selectContact,
        "emergencyContacts": emergencyContacts,
        "goBack": () => {
          Core.Navigation.navigate(navigation, AppRoutes.navigationRouts.trustedContacts)
          getEmergencySettings()->ignore
        },
      },
    )
  }

  let checkAndAskContactPermission = async () => {
    let permissionStatus = await checkPermission()
    switch permissionStatus {
    | "authorized" => navigateToSelectContactScreen()
    | _ => {
        let status = await requestPermission()
        switch status {
        | "authorized" => navigateToSelectContactScreen()
        | _ => {
            Console.log("debug contact permission not-given/denied")
            ()
          }
        }
      }
    }
  }

  let headerComponent = {
    let liveTrackingView = {
      let imageSource = ReactNative.Image.Source.fromRequired(
        Packager.require("../../resources/assets/png/ic_live_tracking.png"),
      )
      <View style={tw(`self-center mt-3`)}>
        <Image source=imageSource style={tw(`h-50 w-25`)} />
      </View>
    }

    {
      if emergencyContacts->Array.length > 0 {
        React.null
      } else {
        liveTrackingView
      }
    }
  }

  let addContactButtonView = {
    <PressableButton
      text=ADD_CONTACTS
      backgroundColor={`ctaSecondaryDisabled`}
      textColor=ThemebasedStyle.colorClass.textPrimary
      borderColor={`borderNeutralMid`}
      overRideStyle={tw(`mt-3`)}
      onPress={() => {
        checkAndAskContactPermission()->ignore
      }}
    />
  }

  let toggleShareRideDropDown = (index: option<int>) => {
    setShareRideOptionsVisibility(_ =>
      switch index {
      | Some(idx) =>
        switch showShareRideOptions {
        | Some(_) => None
        | None => Some({string_of_int(idx) ++ "emergencyContactCardView"})
        }
      | None => None
      }
    )
  }

  let modifyShareRideOption = (shareRideType: shareTripOption, contactIndex: int) => {
    switch safetyContext {
    | Some(emergencySetting) => {
        shareRideOptionModified.current = false
        let modifiedEmergencyContact =
          emergencySetting.defaultEmergencyNumbers->Array.mapWithIndex((item, idx) => {
            if contactIndex == idx {
              if item.shareTripWithEmergencyContactOption != Some(shareRideType) {
                shareRideOptionModified.current = true
              }
              {...item, shareTripWithEmergencyContactOption: Some(shareRideType)}
            } else {
              item
            }
          })
        if shareRideOptionModified.current {
          updateEmergencyContacts(modifiedEmergencyContact)
        }
      }
    | None => ()
    }
    toggleShareRideDropDown(Some(contactIndex))
  }

  let deleteEmergencyContact = (contactIndex: int) => {
    switch safetyContext {
    | Some(emergencySetting) => {
        let modifiedEmergencyContact =
          emergencySetting.defaultEmergencyNumbers->Array.filterWithIndex((_, index) =>
            index != contactIndex
          )
        updateEmergencyContacts(modifiedEmergencyContact)
      }
    | None => ()
    }
  }

  let shareRideOptionDropDown = (contactIndex: int) => {
    <ReanimatedView
      style={array([tw(`flex-col w-full rounded-lg bg-white absolute top-11 z-1`), shadowStyle])}>
      {shareRideOptions
      ->Array.mapWithIndex((item, index) => {
        <View style={tw(`p-3 flex-row`)} key={string_of_int(index) ++ "shareRideOptionView"}>
          <PressableComponent onPress={_ => modifyShareRideOption(item, contactIndex)}>
            <TextWrapper
              textType={SBody_600}
              text={getShareRideOption(item)}
              color=ThemebasedStyle.colorClass.textHigh
            />
          </PressableComponent>
        </View>
      })
      ->React.array}
    </ReanimatedView>
  }

  let emergencyContactCardView = (~contact: EmergencyContacts.contactDetails, ~index) => {
    <View
      style={tw(`mt-5 p-4 flex-col rounded-2xl border-[1px] border-borderNeutralMid bg-ctaSecondaryDisabled`)}
      key={string_of_int(index) ++ "emergencyContactCardView"}>
      <View style={tw(`flex-row items-center justify-between`)}>
        <View style={tw(`flex-row items-center gap-2`)}>
          <View style={tw(`w-10 h-10 my-2.5 justify-center rounded-full bg-iconProgress`)}>
            <TextWrapper
              textType={Body_800}
              text=CUSTOM_TEXT({
                text: Js.String.toUpperCase(Js.String.charAt(0, contact.name)),
              })
              color=ThemebasedStyle.colorClass.textHigh
              overRideStyle={tw(`flex-row self-center text-black`)}
            />
          </View>
          <View style={tw(`flex-col`)}>
            <TextWrapper
              textType={Body_700}
              text=CUSTOM_TEXT({text: contact.name})
              color=ThemebasedStyle.colorClass.textBlack
            />
            <TextWrapper
              textType={SBody_600}
              text=CUSTOM_TEXT({text: contact.mobileCountryCode ++ " " ++ contact.mobileNumber})
              color=ThemebasedStyle.colorClass.textHigh
            />
          </View>
        </View>
        <PressableComponent
          onPress={_ => deleteEmergencyContact(index)}
          style={tw(`px-3 py-3 rounded-full bg-[#E5545415]`)}>
          <Image
            source={ReactNative.Image.Source.fromRequired(
              Packager.require("../../resources/assets/png/ic_trash.png"),
            )}
            style={tw(`w-4.5 h-4.5 self-center`)}
          />
        </PressableComponent>
      </View>
      <View style={tw(`mt-4`)}>
        <TouchableWithoutFeedback onPress={_ => toggleShareRideDropDown(Some(index))}>
          <View style={tw(`p-3 flex-row rounded-lg bg-white`)}>
            <TextWrapper
              textType={SBody_600}
              text={switch contact.shareTripWithEmergencyContactOption {
              | Some(shareRideType) => getShareRideOption(shareRideType)
              | None => SHARE_RIDE_OPTIONS
              }}
              color=ThemebasedStyle.colorClass.textHigh
            />
          </View>
        </TouchableWithoutFeedback>
        {switch showShareRideOptions {
        | Some(key) =>
          if key == string_of_int(index) ++ "emergencyContactCardView" {
            shareRideOptionDropDown(index)
          } else {
            React.null
          }
        | None => React.null
        }}
      </View>
    </View>
  }

  <View style={tw(`h-full w-full bg-white`)}>
    <HeaderWithSafeArea
      title=TRUSTED_CONTACTS
      onBackPress={_ => {
        navigation->Core.Navigation.goBack()
      }}
      backgroundColor="bg-fillPrimaryLow"
      component=headerComponent
    />
    <ScrollView showsVerticalScrollIndicator=false>
      <View style={tw(`flex-col h-full w-full bg-white px-4 py-5`)}>
        <TextWrapper
          color=ThemebasedStyle.colorClass.textBlack textType={Head_800} text=LIVE_RIDE_TRACKING
        />
        <TextWrapper
          color=ThemebasedStyle.colorClass.textHigh
          textType={Body_600}
          text=YOU_CAN_SET_UP_AUTOMATIC_SHARING_OF_LIVE_TRACKING_FOR_YOUR_TRUSTED_CONTACTS
          overRideStyle={tw(`pt-2`)}
        />
        {
          let contactLength = emergencyContacts->Array.length

          {
            <View>
              {if contactLength > 0 {
                <View>
                  {emergencyContacts
                  ->Array.mapWithIndex((item, index) =>
                    emergencyContactCardView(~contact=item, ~index)
                  )
                  ->React.array}
                </View>
              } else {
                React.null
              }}
              {if contactLength < Constants.emergencyContactLimit {
                addContactButtonView
              } else {
                React.null
              }}
              {<View
                style={tw(`mt-3 p-4 flex-col rounded-2xl border-[1px] border-borderNeutralMid bg-ctaSecondaryDisabled`)}>
                <TextWrapper
                  color=ThemebasedStyle.colorClass.textHigh
                  textType={Body_600}
                  text=YOU_CAN_ALSO_SHARE_MANUALLY_WITH_ANYBODY_USING_SHARE_BUTTON
                />
              </View>}
            </View>
          }
        }
      </View>
    </ScrollView>
  </View>
}
