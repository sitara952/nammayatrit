open MMKV

type issueType = REQUEST_TO_DELETE_ACCOUNT | CUSTOM_ISSUE(string, string)
let mmkv = MMKV.createMMKV()
let getReasonAndDes = (issue: issueType): SendIssueApi.issue => {
  switch issue {
  | REQUEST_TO_DELETE_ACCOUNT => {
      reason: "Request To Delete Account",
      description: "Request To Delete Account",
    }
  | CUSTOM_ISSUE(reason, description) => {
      reason,
      description,
    }
  }
}

module DeleteAccountConfirmation = {
  @react.component
  let make = (~closeModal) => {
    let (_, setNavigationState) = React.useContext(NavigationStateContext.navigationStateContext)
    let (userProfile, _) = React.useContext(UserProfileContext.userProfileContext)
    let handlepress = async () => {
      let sendIssueReq: SendIssueApi.sendIssueReq = {
        contactEmail: userProfile.email,
        rideBookingId: None,
        issue: getReasonAndDes(REQUEST_TO_DELETE_ACCOUNT),
        nightSafety: Some(false),
      }

      ApiCall.callPostAPI(
        ~url=ApiRoutes.apiRoutes.sendIssue,
        ~body={sendIssueReq->SendIssueApi.encodeSendIssueReq},
        ~onSuccess=_ => {
          closeModal()
          MMKV.deleteItem(mmkv, REGISTRATION_TOKEN)
          setNavigationState(_ => CustomerInterest)
        },
        ~onError=err => {
          Console.log2("Issue Request Failed", err)
        },
      )->ignore
    }
    <PopUpModal
      popUpModalType=PopUpModal.PopUp1({
        title: SORRY_TO_HEAR_YOU_GO,
        onClose: None,
        primaryText: YOUR_PREFERENCE_HAS_BEEN_NOTED,
        button1: None,
        button2: Some({
          text: OKAY,
          onPress: {_ => handlepress()->ignore},
        }),
      })
    />
  }
}

module DeleteAccountPopup = {
  @react.component
  let make = () => {
    let (modal, setModal, closeModal) = React.useContext(BottomSheetModalContext.modalContext)

    <PopUpModal
      popUpModalType=PopUpModal.PopUp1({
        title: DELETE_ACCOUNT,
        onClose: None,
        primaryText: ARE_YOU_SURE_WANT_TO_DELETE_THE_ACCOUNT,
        button1: Some({
          text: DELETE_ACCOUNT,
          backgroundColor: "ctaPrimaryActive",
          textColor: "textWhite",
          onPress: {
            _ =>
              setModal({
                ...modal,
                modalComponent: Some(<DeleteAccountConfirmation closeModal />),
                backgroundClick: () => closeModal(),
              })
          },
        }),
        button2: Some({
          text: CANCEL,
          backgroundColor: "fillNeutralLow",
          textColor: "textNegative",
          onPress: {_ => closeModal()},
        }),
      })
    />
  }
}
