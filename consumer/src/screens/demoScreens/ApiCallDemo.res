open ReactNavigation
open ReactNative
open Style
@react.component(: Core.screenProps)
let make = (~navigation as _, ~route as _) => {
  let (aythRes, setAuthRes) = React.useState(_ => None)
  let (loading, setLoading) = React.useState(_ => None)

  let onPress = () => {
    setLoading(_ => Some(true))
    ApiCall.callPostAPI(
      ~url=ApiRoutes.apiRoutes.auth,
      ~body=AuthApi.getBody(~number="8770728408")->AuthApi.toJSON,
      ~onSuccess={
        data => {
          Console.log2("apicall res", data)
          setAuthRes(_ => AuthApi.jsonToAuthType(data))
          setLoading(_ => Some(false))
        }
      },
      ~onError={
        _ => {
          setLoading(_ => Some(false))
        }
      },
    )->ignore
  }

  <ScreenWrapperWithSafeArearViewAndPadding>
    <View style={viewStyle(~flex=1., ~alignItems=#center, ~justifyContent=#center, ())}>
      {switch aythRes {
      | Some(val) =>
        <TextWrapper
          textType={SHead_700}
          text=CUSTOM_TEXT({
            text: {val->JSON.stringifyAny->Option.getOr("checkApiCall")},
          })
        />
      | None => React.null
      }}
      {switch loading {
      | Some(val) => val ? <ActivityIndicator /> : React.null
      | None => React.null
      }}
      <CustomButton text="Make Api call" onPress={_ => onPress()} />
    </View>
  </ScreenWrapperWithSafeArearViewAndPadding>
}
