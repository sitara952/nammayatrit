open MMKVStore

type t

type mode = SINGLE_PROCESS | MULTI_PROCESS

type configuration = {
  id: string,
  path?: string,
  encryptionKey?: string,
  mode?: mode,
}

// Use our TypeScript wrapper instead of direct MMKV
@module("@/utils/mmkvUtils") @new external createMMKV: unit => t = "createMMKV"

// Method bindings - these will work with both MMKV and EncryptedStorageWrapper
@send external setString: (t, string, string) => unit = "set"
@send external setBool: (t, string, bool) => unit = "set"
@send external setFloat: (t, string, float) => unit = "set"
@send external setInt: (t, string, int) => unit = "set"

@send external getString: (t, string) => option<string> = "getString"
@send external getBool: (t, string) => option<bool> = "getBoolean"
@send external getFloat: (t, string) => option<float> = "getNumber"
@send external getInt: (t, string) => option<int> = "getNumber"

@send external contains: (t, string) => bool = "contains"
@send external delete: (t, string) => unit = "delete"
@send external getAllKeys: (t, unit) => array<string> = "getAllKeys"
@send external clearAll: (t, unit) => unit = "clearAll"
@send external recrypt: (t, option<string>) => unit = "recrypt"
@send external trim: t => unit = "trim"
@get external size: t => int = "size"

@send
external addOnValueChangedListener: (t, string => unit) => unit = "addOnValueChangedListener"

// Keep the original MMKV hooks for compatibility
@module("react-native-mmkv/")
external useMMKVString: string => (string, (string => string) => unit) = "useMMKVString"
@module("react-native-mmkv/")
external useMMKVBoolean: string => (bool, (bool => bool) => unit) = "useMMKVBoolean"
@module("react-native-mmkv/")
external useMMKVFloat: string => (float, (float => float) => unit) = "useMMKVNumber"
@module("react-native-mmkv/")
external useMMKVInt: string => (int, (int => int) => unit) = "useMMKVNumber"

// Utility functions with same interface as before
let setStringItem = (mmkv: t, key: mmkvKey, item: string) => {
  mmkv->setString(getMMKVKeyValue(key), item)
}
let setBoolItem = (mmkv: t, key: mmkvKey, item: bool) => {
  mmkv->setBool(getMMKVKeyValue(key), item)
}
let setFloatItem = (mmkv: t, key: mmkvKey, item: float) => {
  mmkv->setFloat(getMMKVKeyValue(key), item)
}
let setIntItem = (mmkv: t, key: mmkvKey, item: int) => {
  mmkv->setInt(getMMKVKeyValue(key), item)
}
let deleteItem = (mmkv: t, key: mmkvKey) => {
  mmkv->delete(getMMKVKeyValue(key))
}

let getStringItem = (mmkv: t, key: mmkvKey): option<string> => {
  mmkv->getString(getMMKVKeyValue(key))
}
let getBoolItem = (mmkv: t, key: mmkvKey): option<bool> => {
  mmkv->getBool(getMMKVKeyValue(key))
}
let getFloatItem = (mmkv: t, key: mmkvKey): option<float> => {
  mmkv->getFloat(getMMKVKeyValue(key))
}
let getIntItem = (mmkv: t, key: mmkvKey): option<int> => {
  mmkv->getInt(getMMKVKeyValue(key))
}
