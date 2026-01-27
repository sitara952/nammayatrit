open ReactNative
type element = {
  expand: unit => unit,
  collapse: unit => unit,
  close: unit => unit,
  snapToIndex: float => unit,
}
type ref = Ref.t<element>

include TextInputMethods.Make({
  type t = element
})

include NativeMethods.Make({
  type t = element
})
