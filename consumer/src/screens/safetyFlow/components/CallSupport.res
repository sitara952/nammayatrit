open ReactNative

@react.component
let make = (~closeSafetyModal) => {
  <PopUpModal
    popUpModalType=PopUpModal.PopUp1({
      title: CALL_CUSTOMER_SUPPORT,
      onClose: Some(closeSafetyModal),
      primaryText: IF_YOU_HAVE_INQUIRIES_ABOUT_YOUR_TRANSACTION_HISTORY_NEED_CORRECTION,
      button1: None,
      button2: Some({
        text: CALL_SUPPORT,
        onPress: () => Linking.openURL("tel:" ++ Constants.customerSupportNumber)->ignore,
      }),
    })
  />
}
