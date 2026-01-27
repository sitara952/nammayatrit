open ReactNative
open AppPermissions

// Example to request for a specific permission
let requestCamera = () => {
  let permission = switch Platform.os {
  | #ios => Ios.camera
  | _ => Android.camera
  }

  request(permission)->Promise.then(permissionStatus =>
    switch permissionStatus {
    | _ => Promise.resolve()
    //  | _ => Promise.reject(Js.Exn.raiseError("permission error"))
    }
  )
}

// Function to request for a specific permission
let getPermission = (permissionName: string) => {
  let permission = switch Platform.os {
  | #ios =>
    switch permissionName {
    | "camera" => Ios.camera
    | "location" => Ios.location_when_in_use
    | _ => Js.Exn.raiseError("Permission Not Defined")
    }
  | #android =>
    switch permissionName {
    | "camera" => Android.camera
    | "location" => Android.access_fine_location
    | "post notification" => Android.post_notifications
    | "write external storage" => Android.write_external_storage
    | _ => Js.Exn.raiseError("Permission Not Defined")
    }
  | _ => Js.Exn.raiseError("Unsupported platform")
  }
  request(permission)->Promise.then(permissionStatus =>
    switch permissionStatus {
    | _ => Promise.resolve()
    // | _ => Promise.reject(Js.Exn.raiseError("permission error"))
    }
  )
}

// Function to request for multiple permissions
let requestMultiple = permissionsArray => {
  let permissions = switch Platform.os {
  | #ios => permissionsArray
  | _ => permissionsArray
  }

  requestMultiple(permissions)->Promise.then(permissionStatuses => {
    Console.log(permissionStatuses)
    switch permissionStatuses {
    | _ => Promise.resolve()

    //| _ => Promise.reject(Js.Exn.raiseError("permission error"))
    }
  })
}

/* Sample to call the function in a component to request permissions

open ReactNative
open PermissionHelpers

@react.component
let make = () => {
  let (permissionStatus, setPermissionStatus) = React.useState(_ => "")

  let handleCheckAndRequestPermission = () => {
    let res = getPermission("location")
    Console.log2("Checking and Requesting Permission", res)
  }


  <View>
    <TextWrapper text="Test permission flow here: " textType={Body_700} />
    <Text> {React.string("Permission Status: " ++ permissionStatus)} </Text>
    <Button title="Check and Request Permission" onPress={_ => handleCheckAndRequestPermission()} />
  </View>
}

*/
