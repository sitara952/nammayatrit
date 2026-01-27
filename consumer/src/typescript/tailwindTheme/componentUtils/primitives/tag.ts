import token from '../../../designSystem/tokens';

export const tagUtils = {
    '.tag-primary-md': `flex-row items-center bg-[${token?.default?.primary?.default}]
      rounded-[${token?.corner?.lg}] px-[${token?.gap?.spacing?.[12]}] h-[${token?.height?.sm}] self-center`,

    '.tag-secondary-md': `flex-row items-center bg-white border border-[${token?.default?.secondary?.outline?.default}]
      rounded-[24px] px-[${token?.gap?.spacing?.[12]}] h-[${token?.height?.md}] self-center`,

    '.tag-secondary-inverse-md': `flex-row items-center bg-white
      rounded-[${token?.corner?.lg}] px-[${token?.gap?.spacing?.[12]}] h-[${token?.height?.sm}] self-center`,

    '.tag-secondary-dark-md': `flex-row items-center bg-white border border-[${token?.default?.secondary?.outline?.default}]
      rounded-[${token?.corner?.lg}] px-[${token?.gap?.spacing?.[12]}] h-[${token?.height?.sm}] self-center`,
};
