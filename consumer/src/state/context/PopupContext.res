type popupType = NO_POPUP

type popupState = {
  showPopup: bool,
  popupType: popupType,
}

let defaultPopupState = {
  showPopup: false,
  popupType: NO_POPUP,
}

let defaultSetter = (_: popupState) => ()
let popupStateContext = React.createContext((defaultPopupState, defaultSetter))

module Provider = {
  let makeProps = (~value, ~children, ()) =>
    {
      "value": value,
      "children": children,
    }
  let make = React.Context.provider(popupStateContext)
}

@react.component
let make = (~children) => {
  let (state, setState) = React.useState(_ => defaultPopupState)
  let setState' = React.useCallback1(val => {
    setState(_ => val)
  }, [setState])

  <Provider value=(state, setState')> children </Provider>
}
