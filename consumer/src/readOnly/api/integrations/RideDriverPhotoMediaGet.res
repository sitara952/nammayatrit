open Utils

let rideDriverPhotoMediaGetApiCall = async (filePath: string) => {
  let data = await ApiCall.callGetAPI'(
    ~url="/ride/driver/photo/media" ++ ("?" ++ "&filePath=" ++ filePath),
  )
  String.decodeString(data)
}
