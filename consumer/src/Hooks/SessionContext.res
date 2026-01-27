// SessionContext.res

type sessionContext = {
  sessionId: string,
  resetSessionId: unit => unit,
}

let context = React.createContext({
  sessionId: "",
  resetSessionId: () => (),
})

module ContextProvider = {
  let make = React.Context.provider(context)
}

module Provider = {
  @react.component
  let make = (~children) => {
    let (sessionId, setSessionId) = React.useState(() => "")

    React.useEffect0(() => {
      let initSessionId = async () => {
        let newId = Uuid.V4.make()
        await EncryptedStorage.setItem(SESSION_ID, newId)
        setSessionId(_ => newId)
      }
      initSessionId()->ignore
      None
    })

    let resetSessionId = React.useCallback0(() => {
      let newId = Uuid.V4.make()
      EncryptedStorage.setItem(SESSION_ID, newId)->ignore
      setSessionId(_ => newId)
    })

    let value = {
      sessionId,
      resetSessionId,
    }

    <ContextProvider value> children </ContextProvider>
  }
}

let useSession = () => {
  React.useContext(context)
}
