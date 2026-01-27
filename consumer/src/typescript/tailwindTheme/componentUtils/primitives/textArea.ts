import { Platform } from 'react-native';
import token from '../../../designSystem/tokens';

export const textArea = {
    '.text-area-secondary': ` bg-[${token?.default?.secondary?.default}] 
  gap-[8px] ${
      Platform.OS === 'ios' ? `p-[${token?.spacing?.[16]}]` : `px-[${token?.spacing?.[8]}]`
  }  h-[100px] rounded-[${token?.corner?.md}] border 
  border-[${token?.default?.secondary?.outline?.default}]`,
    '.text-area-primary': ` bg-[${token?.default?.secondary?.default}] 
  gap-[8px] ${
      Platform.OS === 'ios' ? `p-[${token?.spacing?.[16]}]` : `px-[${token?.spacing?.[8]}]`
  }  h-[80px] rounded-[${token?.corner?.md}] border 
  border-[${token?.default?.secondary?.outline?.default}]`,
};
