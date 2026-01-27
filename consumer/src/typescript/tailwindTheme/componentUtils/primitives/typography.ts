import token from '../../../designSystem/tokens';

export const typographyUtils = {
    '.callout': `text-[${token?.callout['callout-fontSize']}]
      font-${token?.callout?.['callout-weight']} leading-[${token?.callout['callout-lineHeight']}]
          tracking-[${token?.callout['callout-characterSpacing']}]`,

    '.callout-1': `text-[${token?.['callout-1']?.['callout-fontSize']}] font-${token?.['callout-1']?.['callout-weight']}
      leading-[${token?.['callout-1']?.['callout-lineHeight']}] tracking-[${token?.['callout-1']?.['callout-characterSpacing']}]`,

    '.callout-2': `text-[${token?.['callout-2']?.['callout-fontSize']}] font-${token?.['callout-2']?.['callout-weight']}
      leading-[${token?.['callout-2']?.['callout-lineHeight']}] tracking-[${token?.['callout-2']?.['callout-characterSpacing']}]`,

    '.subhead': `text-[${token?.subhead?.['subhead-fontSize']}] font-${token?.subhead?.['subhead-weight']}
      leading-[${token?.subhead?.['subhead-lineHeight']}] tracking-[${token?.subhead?.['subhead-characterSpacing']}]`,

    '.subhead-800': `text-[${token?.['subhead-800']?.['subhead-fontSize']}] font-${token?.['subhead-800']?.['subhead-weight']}
      leading-[${token?.['subhead-800']?.['subhead-lineHeight']}] tracking-[${token?.['subhead-800']?.['subhead-characterSpacing']}]`,

    '.subhead-700': `text-[${token?.['subhead-700']?.['subhead-fontSize']}] font-${token?.['subhead-700']?.['subhead-weight']}
      leading-[${token?.['subhead-700']?.['subhead-lineHeight']}] tracking-[${token?.['subhead-700']?.['subhead-characterSpacing']}]`,

    '.subhead-600': `text-[${token?.['subhead-600']?.['subhead-fontSize']}] font-${token?.['subhead-600']?.['subhead-weight']}
      leading-[${token?.['subhead-600']?.['subhead-lineHeight']}] tracking-[${token?.['subhead-600']?.['subhead-characterSpacing']}]`,

    '.subhead-900': `text-[${token?.['subhead-900']?.['subhead-fontSize']}] font-${token?.['subhead-900']?.['subhead-weight']}
      leading-[${token?.['subhead-900']?.['subhead-lineHeight']}] tracking-[${token?.['subhead-900']?.['subhead-characterSpacing']}]`,

    '.subhead-1': `text-[${token?.['subhead-1']?.['subhead-fontSize']}] font-${token?.['subhead-1']?.['subhead-weight']}
      leading-[${token?.['subhead-1']?.['subhead-lineHeight']}] tracking-[${token?.['subhead-1']?.['subhead-characterSpacing']}]`,

    '.subhead-2': `text-[${token?.['subhead-2']?.['subhead-fontSize']}] font-${token?.['subhead-2']?.['subhead-weight']}
      leading-[${token?.['subhead-2']?.['subhead-lineHeight']}] tracking-[${token?.['subhead-2']?.['subhead-characterSpacing']}]`,

    '.subhead-3': `text-[${token?.['subhead-3']?.['subhead-fontSize']}] font-${token?.['subhead-3']?.['subhead-weight']}
      leading-[${token?.['subhead-3']?.['subhead-lineHeight']}] tracking-[${token?.['subhead-3']?.['subhead-characterSpacing']}]`,
    '.subhead-4': `text-[${token?.['subhead-4']?.['subhead-fontSize']}] font-${token?.['subhead-4']?.['subhead-weight']}
      leading-[${token?.['subhead-4']?.['subhead-lineHeight']}] tracking-[${token?.['subhead-4']?.['subhead-characterSpacing']}]`,
    '.body': `text-[${token?.body?.['body-fontSize']}] font-${token?.body?.['body-weight']}
      leading-[${token?.body?.['body-lineHeight']}] tracking-[${token?.body?.['body-characterSpacing']}]`,

    '.body-subtext': `text-[${token?.['body-subtext']?.['body-fontSize']}] font-${token?.['body-subtext']?.['body-weight']}
      leading-[${token?.['body-subtext']?.['body-lineHeight']}] tracking-[${token?.['body-subtext']?.['body-characterSpacing']}]`,

    '.body-1': `text-[${token?.['body-1']?.['body-fontSize']}] font-${token?.['body-1']?.['body-weight']}
      leading-[${token?.['body-1']?.['body-lineHeight']}] tracking-[${token?.['body-1']?.['body-characterSpacing']}]`,

    '.body-4': `text-[${token?.['body-4']?.['body-fontSize']}] font-${token?.['body-4']?.['body-weight']}
      leading-[${token?.['body-4']?.['body-lineHeight']}] tracking-[${token?.['body-4']?.['body-characterSpacing']}]`,

    '.body-5': `text-[${token?.['body-5']?.['body-fontSize']}] font-${token?.['body-5']?.['body-weight']}
    leading-[${token?.['body-5']?.['body-lineHeight']}] tracking-[${token?.['body-5']?.['body-characterSpacing']}]`,
    '.body-6': `text-[${token?.['body-6']?.['body-fontSize']}] font-${token?.['body-6']?.['body-weight']}
    leading-[${token?.['body-6']?.['body-lineHeight']}] tracking-[${token?.['body-6']?.['body-characterSpacing']}]`,
    '.body-7': `text-[${token?.['body-7']?.['body-fontSize']}] font-${token?.['body-7']?.['body-weight']}
    leading-[${token?.['body-7']?.['body-lineHeight']}] tracking-[${token?.['body-7']?.['body-characterSpacing']}]`,
    '.body-8': `text-[${token?.['body-8']?.['body-fontSize']}] font-${token?.['body-8']?.['body-weight']}
    leading-[${token?.['body-8']?.['body-lineHeight']}] tracking-[${token?.['body-8']?.['body-characterSpacing']}]`,

    '.body-2': `text-[${token?.['body-2']?.['body-fontSize']}] font-${token?.['body-2']?.['body-weight']}
      leading-[${token?.['body-2']?.['body-lineHeight']}] tracking-[${token?.['body-2']?.['body-characterSpacing']}]`,
    '.micro': `text-[${token?.['micro']?.['micro-fontSize']}] font-${token?.['micro']?.['micro-weight']}
      leading-[${token?.['micro']?.['micro-lineHeight']}] tracking-[${token?.['micro']?.['micro-characterSpacing']}]`,
    '.body-3': `text-[${token?.body?.['body-fontSize']}] font-${token?.body?.['body-weight']}
  leading-[${token?.body?.['body-lineHeight']}] tracking-[${token?.body?.['body-characterSpacing']}]`,

    '.title-2': `text-[${token?.['title-2']['title-fontSize']}] font-${token?.['title-2']['title-weight']}
  leading-[${token?.['title-2']['title-lineHeight']}] tracking-[${token?.['title-2']['title-characterSpacing']}]`,

    '.title-3': `text-[${token?.['title-3']['title-fontSize']}] font-${token?.['title-3']['title-weight']}
  leading-[${token?.['title-3']['title-lineHeight']}] tracking-[${token?.['title-3']['title-characterSpacing']}]`,

    '.title-4': `text-[${token?.['title-4']['title-fontSize']}] font-${token?.['title-4']['title-weight']}
  leading-[${token?.['title-4']['title-lineHeight']}] tracking-[${token?.['title-4']['title-characterSpacing']}]`,

    '.title-800': `text-[${token?.['title-800']['title-fontSize']}] font-${token?.['title-800']['title-weight']}
  leading-[${token?.['title-800']['title-lineHeight']}] tracking-[${token?.['title-800']['title-characterSpacing']}]`,

    '.title-800-rupee': `text-[${token?.['title-800-rupee']['title-fontSize']}] font-${token?.['title-800-rupee']['title-weight']}
  leading-[${token?.['title-800-rupee']['title-lineHeight']}] tracking-[${token?.['title-800-rupee']['title-characterSpacing']}]`,

    '.subhead-1-rupee': `text-[${token?.['subhead-1-rupee']['subhead-fontSize']}] font-${token?.['subhead-1-rupee']['subhead-weight']}
  leading-[${token?.['subhead-1-rupee']['subhead-lineHeight']}] tracking-[${token?.['subhead-1-rupee']['subhead-characterSpacing']}]`,

    '.sub-body-700': `text-[${token?.['sub-body-700']['sub-body-fontSize']}] font-${token?.['sub-body-700']['sub-body-weight']}
  leading-[${token?.['sub-body-700']['sub-body-lineHeight']}] tracking-[${token?.['sub-body-700']['sub-body-characterSpacing']}]`,

    '.sub-body-800': `text-[${token?.['sub-body-800']['sub-body-fontSize']}] font-${token?.['sub-body-800']['sub-body-weight']}
  leading-[${token?.['sub-body-800']['sub-body-lineHeight']}] tracking-[${token?.['sub-body-800']['sub-body-characterSpacing']}]`,

    '.sub-body-500': `text-[${token?.['sub-body-500']['sub-body-fontSize']}] font-${token?.['sub-body-500']['sub-body-weight']}
  leading-[${token?.['sub-body-500']['sub-body-lineHeight']}] tracking-[${token?.['sub-body-500']['sub-body-characterSpacing']}]`,
};
