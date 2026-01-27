import {strings} from 'config-types';
import {CategoryType} from '@/typescript/screens/home/homeComponents/Card';
import {City} from 'config-types'


export const getCategory = (name: string | undefined): CategoryType => {
  switch (name?.toLowerCase()) {
    case 'airport':
      return CategoryType.Airport;
    case 'park':
      return CategoryType.Park;
    case 'museum':
      return CategoryType.Museum;
    case 'sciencepark':
      return CategoryType.SciencePark;
    case 'heritage':
      return CategoryType.Heritage;
    case 'promotional':
      return CategoryType.Promotional;
    case 'event':
      return CategoryType.Events;
    case 'nammavideos':
      return CategoryType.NammaVideos;
    case 'videos':
      return CategoryType.Videos;
    case 'shopping':
      return CategoryType.Shopping;
    case 'eateries':
      return CategoryType.Eateries;
    case 'publictransport':
      return CategoryType.PublicTransport;
    case 'beach':
      return CategoryType.Beach;
    case 'sports':
      return CategoryType.Sports;
    case 'office':
      return CategoryType.Office;
    default:
      return CategoryType.Park; // Default case
  }
};

export const getCategoryName = (
  category: CategoryType,
  userLanguageStrings: strings,
  city: City,
): string => {
  switch (category) {
    case CategoryType.Airport:
      return userLanguageStrings.Airport;
    case CategoryType.Park:
      return userLanguageStrings.Park;
    case CategoryType.Museum:
      return userLanguageStrings.Museum;
    case CategoryType.SciencePark:
      return userLanguageStrings.SciencePark;
    case CategoryType.Heritage:
      return userLanguageStrings.Heritage;
    case CategoryType.Promotional:
      return userLanguageStrings.Promotional;
    case CategoryType.Events:
      return userLanguageStrings.Events;
    case CategoryType.NammaVideos:
      return userLanguageStrings.NammaVideos;
    case CategoryType.Videos: {
      switch (city) {
        case 'bangalore':
          case 'mysore':
          case 'tumakuru':
          case 'davanagere':
          case 'shivamogga':
          case 'hubli':
          case 'mangalore':
          case 'gulbarga':
          case 'udupi':
            return userLanguageStrings.NammaVideos;
      
          // Tamil Nadu
          case 'chennai':
          case 'vellore':
          case 'hosur':
          case 'madurai':
          case 'thanjavur':
          case 'tirunelveli':
          case 'salem':
          case 'trichy':
            return userLanguageStrings.NammaVideos;
      
          // Telangana & Andhra Pradesh
          case 'hyderabad':
            return userLanguageStrings.YatriVideos;
      
          // Kerala
          case 'kochi':
          case 'trivandrum':
          case 'thrissur':
          case 'kozhikode':
            return userLanguageStrings.YatriVideos;
      
          // Odisha
          case 'bhubaneswar':
          case 'cuttack':
          case 'puri':
            return userLanguageStrings.YatriVideos;
      
          // West Bengal
          case 'siliguri':
          case 'kolkata':
            return userLanguageStrings.Videos;
      
          // Maharashtra
          case 'goa':
          case 'pune':
          case 'mumbai':
            return userLanguageStrings.YatriVideos;
      
          // Delhi NCR
          case 'delhi':
          case 'noida':
          case 'gurugram':
            return userLanguageStrings.YatriVideos;
      
          // Pondicherry
          case 'pondicherry':
            return userLanguageStrings.NammaVideos;
          default: return userLanguageStrings.Videos
        
      }
    }
    case CategoryType.Shopping:
      return userLanguageStrings.Shopping;
    case CategoryType.Eateries:
      return userLanguageStrings.Eateries;
    case CategoryType.PublicTransport:
      return userLanguageStrings.PublicTransport;
    case CategoryType.Beach:
      return userLanguageStrings.Beach;
    case CategoryType.Sports:
      return userLanguageStrings.Sports;
    case CategoryType.Office:
      return userLanguageStrings.Office;
    default:
      return userLanguageStrings.Park; // Default case
  }
};
