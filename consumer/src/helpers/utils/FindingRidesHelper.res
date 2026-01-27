let clearPollingTime = async () => {
  await EncryptedStorage.removeItem(KeyStore.FINDING_RIDE_CREATED_TIME)
}
