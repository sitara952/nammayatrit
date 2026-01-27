import { Action, Resolver } from '@/typescript/utils/common';
import type { Language_language as languages } from '@/readOnly/api/types/Enums.gen.tsx';
import { LanguageObj } from '../../systems/configs/types';

export type AppLanguageScreenAction =
    | Action<'CONFIRM_APP_LANGUAGE_CLICKED', { selectedLanguage: languages | undefined }>
    | Action<'GO_BACK'>;

export type AppLanguageScreenProps = {
    alDispatch: Resolver<AppLanguageScreenAction>;
    currentLanguage: languages | undefined;
    allowedLanguages: LanguageObj[];
};
