type drawerNavType = {
  toggleDrawer: unit => unit,
  navigateTo: (string, Js.Json.t) => unit,
  navigate: (string, Js.Json.t) => unit,
  drawerNavigation: option<ReactNavigation.Core.navigation>,
  exitPrestoApp: unit => unit,
}

let defaultNavType: drawerNavType = {
  toggleDrawer: () => (),
  navigateTo: (_, _) => (),
  navigate: (_, _) => (),
  drawerNavigation: None,
  exitPrestoApp: _ => (),
}

let defaultSetter = (_: drawerNavType) => ()
let context = React.createContext(defaultNavType)

module Provider = {
  let make = React.Context.provider(context)
}

@react.component
let make = (
  ~children,
  ~toggleDrawer: unit => unit,
  ~navigation: option<ReactNavigation.Core.navigation>,
  ~navigateTo: (string, Js.Json.t) => unit,
  ~navigate: (string, Js.Json.t) => unit,
  ~exitPrestoApp: unit => unit,
) => {
  let contextValue = {
    toggleDrawer,
    drawerNavigation: navigation,
    navigateTo,
    navigate,
    exitPrestoApp,
  }

  <Provider value={contextValue}> {children} </Provider>
}

let drawerContext = make
