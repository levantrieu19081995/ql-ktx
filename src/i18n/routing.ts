// src/i18n/routing.ts
import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['vi', 'en'],
  defaultLocale: 'vi',

   // với next-intl v3:
  localePrefix: 'always'    // luôn bắt buộc có /vi
});
