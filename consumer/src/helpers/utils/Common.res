let generateReferralLink = (
  medium: string,
  term: string,
  content: string,
  campaign: string,
): string => {
  let path = "/refer"
  let packageId = Constants.referralData.customerAppId
  let domain = Constants.referralData.domain
  `${domain}${path}?referrer=%26utm_medium%3D${medium}%26utm_term%3D${term}%26utm_content%3D${content}%26utm_campaign%3D${campaign}%26anid%3Dadmob&id=${packageId}`
}
