open KeyStore
type es

@module("react-native-encrypted-storage")
external encryptedStorage: es = "default"

@send external setItem: (es, string, string) => Promise.t<unit> = "setItem"
@send external getItem: (es, string) => Promise.t<Nullable.t<string>> = "getItem"
@send external removeItem: (es, string) => Promise.t<unit> = "removeItem"
@send external clear: (es, unit) => Promise.t<unit> = "clear"

let setItem = async (key: keyStore, value: string) => {
  await encryptedStorage->setItem(getKeyStoreValue(key), value)
}

let getItem = async (key: keyStore): option<string> => {
  let result = await encryptedStorage->getItem(getKeyStoreValue(key))
  Nullable.toOption(result)
}

let removeItem = async (key: keyStore) => {
  await encryptedStorage->removeItem(getKeyStoreValue(key))
}
