open ReactNavigation
open Tailwind
open ReactNative
open Contact

@react.component(: Core.screenProps)
let make = (~navigation as _, ~route) => {
  let (contacts, setContacts) = React.useState(_ => [])
  let (input, setInput) = React.useState(_ => "")
  let alreadySelectedEmergencyContacts: array<
    EmergencyContacts.contactDetails,
  > = switch route.params {
  | Some(params) => Core.Params.unsafeGetValue(params)["emergencyContacts"]
  | None => []
  }
  let (selectedItem, setSelectedItem) = React.useState(_ => [])
  let (selectedItemLength, setSelectedItemLength) = React.useState(_ => 0)
  let goBack: unit => unit = switch route.params {
  | Some(params) => Core.Params.unsafeGetValue(params)["goBack"]
  | None => () => ()
  }

  let toggleItemSelect = id => {
    if selectedItem->Array.includes(id) {
      setSelectedItem(items => items->Array.filter(itemId => itemId != id))
      setSelectedItemLength(length => length - 1)
    } else if selectedItemLength < Constants.emergencyContactLimit {
      setSelectedItem(items => items->Array.concat([id]))
      setSelectedItemLength(length => length + 1)
    }
  }

  let fetchContacts = async () => {
    if Array.length(contacts) == 0 {
      let contacts = await getAll()
      let alreadySelectedContacts =
        alreadySelectedEmergencyContacts->Array.map(item => item.mobileNumber)
      let regexFilteredContacts = contacts->Array.filterMap(item => {
        let phoneNumber = item.phoneNumbers->Array.get(0)
        switch phoneNumber {
        | Some(number) => {
            let removedCountryCode = String.replaceRegExp(number.number, %re("/^\+91/"), "")
            let filteredNumber = String.replaceAllRegExp(removedCountryCode, %re("/[^0-9]/g"), "")
            if alreadySelectedContacts->Array.includes(filteredNumber) {
              toggleItemSelect(item.recordID)
            }
            Some({...item, phoneNumbers: [{label: "", number: filteredNumber}]})
          }
        | None => None
        }
      })
      regexFilteredContacts->Array.sort((x, y) => String.localeCompare(x.givenName, y.givenName))
      Console.log2("debug contact sorted all contact", regexFilteredContacts)
      setContacts(_ => regexFilteredContacts)
    }
  }

  React.useEffect(() => {
    fetchContacts()->ignore
    None
  }, [])

  <View style={tw(`h-full w-full bg-white`)}>
    <HeaderWithSafeArea
      title=CONTACTS_SELECTED(
        selectedItemLength->Int.toString,
        Constants.emergencyContactLimit->Int.toString,
      )
      onBackPress={_ => goBack()}
      backgroundColor="bg-fillPrimaryLow"
    />
    <Space />
    <CustomInput
      state=input
      setState={text => setInput(_ => text)}
      placeholder=SEARCH_CONTACTS
      enableShadow=false
      backgroundColor="white"
      height=55.
      borderTopLeftRadius=8.
      borderTopRightRadius=8.
      borderBottomLeftRadius=8.
      borderBottomRightRadius=8.
      onFocus={() => ()}
    />
    <PressableComponent style={tw(`m-4`)} onPress={_ => selectedItemLength > 0 ? () : ()}>
      <View
        style={
          let backgroundColor =
            selectedItemLength > 0
              ? ThemebasedStyle.colorString.ctaPrimaryActive
              : ThemebasedStyle.colorString.ctaPrimaryDisabled
          tw(`bg-[${backgroundColor}] py-4 rounded-lg`)
        }>
        <TextWrapper
          text=CONFIRM_EMERGENCY_CONTACTS
          textType={SHead_700}
          color={selectedItemLength > 0
            ? ThemebasedStyle.colorClass.textWhite
            : ThemebasedStyle.colorClass.textMid}
          overRideStyle={tw(`text-center`)}
        />
      </View>
    </PressableComponent>
  </View>
}
