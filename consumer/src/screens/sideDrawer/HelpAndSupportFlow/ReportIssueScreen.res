open ReactNavigation
open ReactNative
open Style
open Tailwind
open Reanimated

@react.component(: Core.screenProps)
let make = (~navigation, ~route) => {
  let categoryItem: option<HelpAndSupportApi.issueCategoryRes> = switch route.params {
  | Some(val) => Some(Core.Params.unsafeGetValue(val)["data"])
  | None => None
  }

  let (messageTxt, setMessageTxt) = React.useState(() => "")
  let (appName, setAppName) = React.useState(() => "")

  React.useEffect0(() => {
    AppInfoModule.getName(~setAppName)->ignore
    None
  })

  let handlepress = async () => {
    let issueReportReq: HelpAndSupportApi.issueReportReqtype = {
      chats: [],
      createTicket: false,
      mediaFiles: [],
      rideId: None,
      optionId: None,
      categoryId: switch categoryItem {
      | Some(val) => val.issueCategoryId
      | None => " "
      },
      description: messageTxt,
    }

    ApiCall.callPostAPI(
      ~url=ApiRoutes.apiRoutes.issueReport,
      ~body={issueReportReq->HelpAndSupportApi.encodeIssueReportReqtype},
      ~onSuccess=_ => {
        setMessageTxt(_ => "")
        if Platform.os == #android {
          ToastAndroid.show("Issue Reported Successfully", ToastAndroid.short)
        } else {
          Alert.alert(~title="Issue Reported Successfully", ())
        }
      },
      ~onError=err => {
        Console.log2("Issue Report failed", err)
        if Platform.os == #android {
          ToastAndroid.show("Issue Report Failed", ToastAndroid.short)
        } else {
          Alert.alert(~title="Issue Report Failed", ())
        }
      },
    )->ignore
  }

  <ScreenWrapperWithSafeArearViewAndPadding paddingHorizontal={0.->dp} backgroundColor="#F6F1FF">
    <HeaderWithSafeArea
      // title={switch categoryItem {
      // | Some(val) => val.category
      // | None => ""
      // } ++ " Report"}
      title={REPORT_ISSUE}
      onBackPress={_ => navigation->Core.Navigation.goBack()}
    />
    <ReanimatedView style={tw(" h-full bg-fillNeutralLow ")}>
      <View style={tw(" flex-col justify-between h-[83%] px-4 py-4")}>
        <CustomInput
          state=messageTxt
          setState={text => setMessageTxt(_ => text)}
          placeholder={DESCRIBE_YOUR_ISSUE(appName)}
          height={300.}
          multiline=true
          paddingBottom={0.->dp}
          paddingHorizontal={0.->dp}
        />
        <CustomButton
          text={"Submit Issue Details"}
          textType={SHead_700}
          useFlex=false
          backgroundColor={`#14171F`}
          rightIcon={CustomIcon(<Svg.SvgXml xml=SendActiveIcon.sendActive />)}
          overRideStyle={tw(`${messageTxt != "" ? "opacity-100" : "opacity-50"}  mt-4`)}
          buttonState={messageTxt == "" ? Disabled : Normal}
          onPress={_ => handlepress()->ignore}
        />
      </View>
    </ReanimatedView>
  </ScreenWrapperWithSafeArearViewAndPadding>
}
