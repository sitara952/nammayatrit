open ReactNative
open Tailwind
open ReactNavigation
open EmergencyContactType
open ShareRideDetail
open Contact

@react.component
let make = (~navigation, ~closeSafetyModal, ~openShareRideInfo: unit => unit) => {
  let (emergencyContacts, setEmergencyContacts) = React.useState(_ => None)

  let toggleContactSelect = (selectedContact: toggleMappedContact) => {
    switch emergencyContacts {
    | Some(contactToggleDatas) => {
        let toggledContacts = contactToggleDatas->Array.map(item => {
          if (
            item.contact.name == selectedContact.contact.name &&
              item.contact.mobileNumber == selectedContact.contact.mobileNumber
          ) {
            {...item, selected: !item.selected}
          } else {
            item
          }
        })
        setEmergencyContacts(_ => Some(toggledContacts))
      }
    | None => ()
    }
  }

  let shareRideDetailApi = (phoneNumbers: array<string>) => {
    ApiCall.callPostAPI(
      ~url=ApiRoutes.apiRoutes.shareRideDetail,
      ~body=makeShareRideDetailReq(phoneNumbers)->Utils.asJson,
      ~onSuccess=_ => {
        closeSafetyModal()
      },
      ~onError={err => Console.log2("createSos API ERROR", err)},
    )->ignore
  }

  let contactView = (contactToggleData: toggleMappedContact, index: int) => {
    <TouchableOpacity
      key={string_of_int(index)}
      onPress={_ => toggleContactSelect(contactToggleData)}
      style={tw(`flex-row items-center justify-between`)}>
      <View style={tw(`flex-row items-center gap-2`)}>
        <View style={tw(`w-8 h-8 my-2.5 justify-center rounded-full bg-iconProgress`)}>
          <TextWrapper
            textType={Body_800}
            text=CUSTOM_TEXT({
              text: Js.String.toUpperCase(Js.String.charAt(0, contactToggleData.contact.name)),
            })
            color=ThemebasedStyle.colorClass.textHigh
            overRideStyle={tw(`flex-row self-center text-black`)}
          />
        </View>
        <TextWrapper
          textType={Body_600}
          text=CUSTOM_TEXT({text: contactToggleData.contact.name})
          color=ThemebasedStyle.colorClass.textMid
          overRideStyle={tw(`flex-row self-center text-black`)}
        />
      </View>
      {switch contactToggleData.selected {
      | false => <View style={tw(`w-4.5 h-4.5 rounded-full border-[1.5px] border-textLow`)} />
      | true =>
        <View style={tw(`w-4.5 h-4.5 rounded-full border-[1.5px] justify-center`)}>
          <View style={tw(`w-3 h-3 self-center rounded-full bg-black`)} />
        </View>
      }}
    </TouchableOpacity>
  }

  let navigateToSelectContacts = () => {
    closeSafetyModal()
    Core.Navigation.navigateWithParams(
      navigation,
      AppRoutes.navigationRouts.safetyScreen,
      {
        "screen": AppRoutes.navigationRouts.selectContact,
        "goBack": openShareRideInfo,
      },
    )
  }

  let checkAndAskContactPermission = async () => {
    let permissionStatus = await checkPermission()
    switch permissionStatus {
    | "authorized" => navigateToSelectContacts()
    | _ => {
        let status = await requestPermission()
        switch status {
        | "authorized" => navigateToSelectContacts()
        | _ => {
            Console.log("debug contact permission not-given/denied")
            ()
          }
        }
      }
    }
  }

  let popUpModalChildView = {
    <View>
      <Seperator margin=10. height=1. color="#E0E3E8" />
      {switch emergencyContacts {
      | Some(contacts) => {
          let contactsLength = contacts->Array.length
          if contactsLength == 0 {
            <View>
              <TextWrapper
                text=ADD_CONTACT_TO_SHARE_LOCATION_AND_RIDE_DETAILS_WITH_EMERGENCY_CONTACTS
                textType={Body_600}
                overRideStyle={tw(`py-1.5`)}
              />
            </View>
          } else {
            <View style={tw(`flex-col`)}>
              {contacts
              ->Array.mapWithIndex((item, index) => contactView(item, index))
              ->React.array}
              {if contactsLength < Constants.emergencyContactLimit {
                <TouchableOpacity
                  onPress={_ => {
                    checkAndAskContactPermission()->ignore
                  }}>
                  <TextWrapper
                    text=ADD_A_CONTACT
                    textType={Body_700}
                    overRideStyle={tw(`my-4 text-textPrimary`)}
                  />
                </TouchableOpacity>
              } else {
                React.null
              }}
            </View>
          }
        }
      | None =>
        <View>
          <ShimmerView isLoading=true height="50" speed=1.0 />
        </View>
      }}
    </View>
  }

  let getEmergencyContacts = () => {
    ApiCall.callGetAPI(
      ~url=ApiRoutes.apiRoutes.emergencyContacts,
      ~onSuccess=resp => {
        switch resp->JSON.Decode.object {
        | Some(obj) => {
            let contacts = EmergencyContacts.getEmergencyContactsMapper(obj)
            let toggleMappedContact: array<toggleMappedContact> =
              contacts.defaultEmergencyNumbers->Array.map(item => {selected: false, contact: item})
            setEmergencyContacts(_ => Some(toggleMappedContact))
          }
        | None => ()
        }
      },
      ~onError=err => {
        Console.error2("getEmergencyContacts error", err)
      },
    )->ignore
  }

  let getSelectedContacts = () => {
    switch emergencyContacts {
    | Some(contacts) =>
      contacts->Array.filter(item => item.selected)->Array.map(item => item.contact.mobileNumber)
    | None => []
    }
  }

  React.useEffect(() => {
    getEmergencyContacts()->ignore
    None
  }, [])

  <PopUpModal
    popUpModalType=PopUpModal.PopUp2({
      title: SHARE_RIDE_INFO,
      onClose: Some(closeSafetyModal),
      children: popUpModalChildView,
      button1: None,
      button2: {
        let isContactSelected = switch emergencyContacts {
        | Some(contacts) => contacts->Array.some(item => item.selected)
        | None => false
        }
        Some({
          text: switch emergencyContacts {
          | Some(contacts) =>
            contacts->Array.length > 0 ? SHARE_LOCATION_AND_RIDE_DETAILS : ADD_EMERGENCY_CONTACTS
          | None => CUSTOM_TEXT({text: ""})
          },
          onPress: () => {
            if isContactSelected {
              let phoneNumbers = getSelectedContacts()
              shareRideDetailApi(phoneNumbers)
            } else if emergencyContacts == None || emergencyContacts == Some([]) {
              checkAndAskContactPermission()->ignore
            } else {
              ()
            }
          },
          textColor: isContactSelected || emergencyContacts == None || emergencyContacts == Some([])
            ? "text-white"
            : ThemebasedStyle.colorClass.textMid,
          backgroundColor: isContactSelected ||
          emergencyContacts == None ||
          emergencyContacts == Some([])
            ? ThemebasedStyle.colorString.ctaPrimaryActive
            : ThemebasedStyle.colorString.ctaPrimaryDisabled,
        })
      },
    })
  />
}
