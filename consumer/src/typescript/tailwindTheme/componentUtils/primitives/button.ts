import token from '../../../designSystem/tokens';

export const buttonUtils = {
    '.button-primary-lg': `flex-row items-center bg-[${token?.default?.primary?.default}] 
      rounded-[${token?.corner?.md}] px-[${token?.spacing?.[3]}] h-[${token?.height?.md}]`,
    '.button-primary-md': `flex-row items-center bg-[${token?.default?.primary?.default}] 
      rounded-[${token?.corner?.lg}] px-[${token?.gap?.spacing?.[12]}] h-[${token?.height?.sm}] self-center`,
    '.button-secondary-lg': `flex-row items-center bg-[${token?.default?.secondary?.default}] border border-[${token?.default?.secondary?.outline?.default}]
      rounded-[${token?.corner?.md}] px-[${token?.spacing?.[3]}] h-[${token?.height?.md}]`,
    '.button-secondary-md': `flex-row items-center bg-[${token?.default?.secondary?.default}] border border-[${token?.default?.secondary?.outline?.default}]
      rounded-[${token?.corner?.lg}] px-[${token?.gap?.spacing?.[12]}] h-[${token?.height?.sm}] self-center`,
    '.button-secondary-inverse-lg': `flex-row items-center bg-[${token?.default?.secondary?.default}]
      rounded-[${token?.corner?.md}] px-[${token?.spacing?.[3]}] h-[${token?.height?.md}]`,
    '.button-secondary-inverse-md': `flex-row items-center bg-[${token?.default?.secondary?.default}] 
      rounded-[${token?.corner?.lg}] px-[${token?.gap?.spacing?.[12]}] h-[${token?.height?.sm}] self-center`,
    '.button-secondary-xl': `px-[${token?.spacing?.[16]}] py-[${token?.spacing?.[12]}]
    rounded-[${token?.corner?.md}]  border border-[${token?.default?.secondary?.outline?.default}]`,
    '.button-link-lg': `flex-row items-center 
      px-[${token?.spacing?.[3]}] h-[${token?.height?.md}]`,
    '.button-secondary-danger-lg': `flex-row items-center bg-[${token?.default?.secondary?.default}]
      rounded-[${token?.corner?.md}] px-[${token?.spacing?.[3]}] h-[${token?.height?.md}]`,
};
