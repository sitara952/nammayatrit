module Zustand = {
  module type StoreConfig = {
    type state
  }

  module MakeStore = (Config: StoreConfig) => {
    type set = (Config.state => Config.state) => unit
    type selector<'a> = Config.state => 'a

    type store

    external unsafeStoreToAny: store => 'a = "%identity"

    let use = (store: store, selector: selector<'a>): 'a => unsafeStoreToAny(store)(selector)

    @module("zustand")
    external create: (set => Config.state) => store = "create"
  }
}

// Example usage:
// module AppStore = {
//   type state = {
//     counter: int,
//     increment: unit => unit,
//     decrement: unit => unit,
//   }
// }

// module SomeStore = Zustand.MakeStore(AppStore)

// let store = SomeStore.create(set => {
//   counter: 0,
//   increment: _ => set(state => {...state, counter: state.counter + 1}),
//   decrement: _ => set(state => {...state, counter: state.counter - 1}),
// })

// let someCounter = store->SomeStore.use(state => state.counter)
// let decrement = store->SomeStore.use(state => state.decrement)
