
// src/i18n/request.ts
import {getRequestConfig} from 'next-intl/server';
import {routing} from '@/i18n/routing';

export default getRequestConfig(async ({locale}) => {
  const supported = new Set(routing.locales);               // ['vi','en']
  const loc = supported.has(locale as any) ? locale! : routing.defaultLocale; 
  return {
    locale: loc,
    messages: (await import(`@/i18n/${loc}.json`)).default
  };
});

