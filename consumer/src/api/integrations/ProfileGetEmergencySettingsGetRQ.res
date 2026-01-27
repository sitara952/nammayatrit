open EmergencySettingsRes
open ReactQuery
open ProfileGetEmergencySettingsGet

module Keys = {
  let all = ["profileGetEmergencySettingsGet"]
}
let useProfileGetEmergencySettingsGet = (~queryKey) => {
  useQuery({
    queryKey,
    queryFn: _ => profileGetEmergencySettingsGetApiCall(),
  })
}
