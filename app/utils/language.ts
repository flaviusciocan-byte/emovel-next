export const detectLanguage = (): string => {
  const supportedLanguages = ["en", "ro", "es", "fr", "de", "it"];
  const browserLanguage = navigator.language.split('-')[0];
  return supportedLanguages.includes(browserLanguage) ? browserLanguage : 'en';
};
