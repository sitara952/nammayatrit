open ReactNative

let useDeepLinkHandler = setAppNavigationState => {
  let (queryVal, setQueryVal) = React.useState(_ => "")

  React.useEffect0(() => {
    let handleDeepLink = (urlValue: Linking.url) => {
      let (_, queryVal) =
        Utils.getQueryParamsDict(urlValue.url)
        ->Dict.toArray
        ->Array.get(0)
        ->Option.getOr(("", ""))

      setQueryVal(_ => queryVal)
      // if queryVal != "" {
      //   // setAppNavigationState(_ => DeepLink)
      // }
    }

    ReactNative.Linking.getInitialURL()
    ->Promise.thenResolve(url => {
      switch url->Null.toOption {
      | Some(urlStr) => handleDeepLink({url: urlStr})
      | None => ()
      }
    })
    ->ignore
    let subscription = ReactNative.Linking.addEventListener(#url, handleDeepLink)
    Some(() => subscription->EventSubscription.remove)
  })

  queryVal
}
