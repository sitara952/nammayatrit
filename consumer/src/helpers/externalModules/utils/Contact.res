type emailAddress = {
  label: string,
  email: string,
}

type phoneNumber = {
  label: string,
  number: string,
}

type contact = {
  recordID: string,
  backTitle: string,
  company: option<string>,
  emailAddresses: array<emailAddress>,
  displayName: string,
  familyName: string,
  givenName: string,
  middleName: string,
  jobTitle: string,
  phoneNumbers: array<phoneNumber>,
  hasThumbnail: bool,
  thumbnailPath: string,
  isStarred: bool,
  prefix: string,
  suffix: string,
  department: string,
  note: string,
}

@module("react-native-contacts") @scope("default")
external requestPermission: unit => Js.Promise.t<string> = "requestPermission"

@module("react-native-contacts") @scope("default")
external checkPermission: unit => Js.Promise.t<string> = "checkPermission"

@module("react-native-contacts") @scope("default")
external getAll: unit => Js.Promise.t<array<contact>> = "getAll"
