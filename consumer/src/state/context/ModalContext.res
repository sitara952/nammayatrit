type modalPosition = [#"center-modal" | #"bottom-modal" | #"top-modal"]

type modalRecordType = {
  position: modalPosition,
  modalscreen: React.element,
}
type modalType = option<modalRecordType>
let defaultSetter = (_: modalType) => ()
let modalContext = React.createContext((None, defaultSetter))

module Provider = {
  let make = React.Context.provider(modalContext)
}
@react.component
let make = (~children) => {
  let (state, setState) = React.useState(_ => None)
  let setState = React.useCallback1(val => {
    setState(_ => val)
  }, [setState])

  <Provider value=(state, setState)> children </Provider>
}
