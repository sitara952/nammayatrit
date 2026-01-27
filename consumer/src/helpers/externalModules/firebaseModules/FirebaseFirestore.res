type firestore

type documentReference
type snapshotMetadata
type query

module Types = {
  type documentReference = documentReference
  type snapshotMetadata = snapshotMetadata
  type query = query
  type queryDocumentSnapshot = {
    id: string,
    metadata: snapshotMetadata,
    ref: documentReference,
  }
  type querySnapshot = {
    docs: array<queryDocumentSnapshot>,
    empty: bool,
    metadata: snapshotMetadata,
    query: query,
    size: int,
  }

  type documentSnapshot = {
    exists: bool,
    id: string,
    metadata: snapshotMetadata,
    ref: documentReference,
  }

  type firestoreCollection = {
    id: string,
    path: string,
    parent: option<documentReference>,
  }
  type source =
    | @as("default") Default
    | @as("server") Server
    | @as("cache") Cache

  type directionString =
    | @as("asc") Asc
    | @as("desc") Desc

  type getOptions = {source: source}
}

// DocumentReference module
module DocumentReference = {
  type t = Types.documentReference

  @send
  external collection: (t, ~collectionPath: string) => Types.firestoreCollection = "collection"
  @send external set: (t, ~data: JSON.t) => promise<unit> = "set"
  @send external get: (t, unit) => promise<Types.querySnapshot> = "get"
}

module SnapshotMetadata = {
  type t = Types.snapshotMetadata
}

module QueryDocumentSnapshot = {
  type t = Types.queryDocumentSnapshot

  @send external data: (t, unit) => JSON.t = "data"
}

module Query = {
  type t = Types.query

  type error
  // Define the observer type with optional functions
  type observer<'a> = {
    next: option<Types.querySnapshot => unit>,
    error: option<error => unit>,
    complete: option<unit => unit>,
  }

  type unsubscribeSnapshotListener = unit => unit

  @send external get: (t, unit) => promise<Types.querySnapshot> = "get"
  @send external count: (t, unit) => promise<int> = "count"
  @send external onSnapshot: (t, observer<'a>) => unsubscribeSnapshotListener = "onSnapshot"
}

module DocumentChange = {
  type t
}

module DocumentSnapshot = {
  type t = Types.documentSnapshot
}

module QuerySnapshot = {
  type t = Types.querySnapshot

  @send
  external forEach: (t, QueryDocumentSnapshot.t => unit, ~thisArg: 'a=?) => unit = "forEach"
  @send
  external forEachWithIndex: (t, (QueryDocumentSnapshot.t, int) => unit, ~thisArg: 'a=?) => unit =
    "forEach"
  @send
  external docChanges: (t, unit) => DocumentChange.t = "docChanges"
}

type error

// Define the observer type with optional functions
type observer<'a> = {
  next: option<Types.querySnapshot => unit>,
  error: option<error => unit>,
  complete: option<unit => unit>,
}

type unsubscribeSnapshotListener = unit => unit
// FirestoreCollection module
module FirestoreCollection = {
  type t = Types.firestoreCollection

  @send external get: (t, unit) => promise<QuerySnapshot.t> = "get"
  @send external doc: (t, ~documentPath: string) => DocumentReference.t = "doc"
  @send external add: (t, ~data: JSON.t) => promise<DocumentReference.t> = "add"
  @send external count: (t, unit) => promise<int> = "count"
  @send external orderBy: (t, string, Types.directionString) => Query.t = "orderBy"
  @send external onSnapshot: (t, observer<'a>) => unsubscribeSnapshotListener = "onSnapshot"
}

@module("@react-native-firebase/firestore")
external firestore: unit => firestore = "default"

@send
external collection: (firestore, ~collectionPath: string) => FirestoreCollection.t = "collection"

external asJson: _ => JSON.t = "%identity"
let msgBody = {
  "message": "i want to test react native firestore",
  "sentBy": "user",
  "timestamp": Js.Date.now(),
}->asJson

firestore()
->collection(~collectionPath="Chats")
->FirestoreCollection.doc(~documentPath="chatChannelID")
->DocumentReference.collection(~collectionPath="messages")
->FirestoreCollection.add(~data=msgBody)
->ignore

firestore()
->collection(~collectionPath="Chats")
->FirestoreCollection.doc(~documentPath="chatChannelID")
->DocumentReference.set(~data=msgBody)
->ignore

// firestore()
// ->collection(~collectionPath="Chats")
// ->FirestoreCollection.doc(~documentPath="chatChannelID")
// ->DocumentReference.get(~options={source: Default})
// ->ignore

firestore()
->collection(~collectionPath="Users")
->FirestoreCollection.get()
->Promise.thenResolve(querySnapshot => {
  Console.log2("Total users: ", querySnapshot.size)

  querySnapshot->QuerySnapshot.forEach(documentSnapshot => {
    Console.log3("User ID: ", documentSnapshot.id, documentSnapshot->QueryDocumentSnapshot.data())
  })
})
->ignore
