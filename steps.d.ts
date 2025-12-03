/// <reference types='codeceptjs' />
type waitHelper = typeof import('./tests/helpers/WaitHelper');
type clickHelper = typeof import('./tests/helpers/ClickHelper');
type assertionHelper = typeof import('./tests/helpers/AssertionHelper');
type navigationHelper = typeof import('./tests/helpers/NavigationHelper');
type elementHelper = typeof import('./tests/helpers/ElementHelper');
type searchHelper = typeof import('./tests/helpers/SearchHelper');
type downloadHelper = typeof import('./tests/helpers/DownloadHelper');

declare namespace CodeceptJS {
  interface SupportObject { I: I, current: any, waitHelper: waitHelper, clickHelper: clickHelper, assertionHelper: assertionHelper, navigationHelper: navigationHelper, elementHelper: elementHelper, searchHelper: searchHelper, downloadHelper: downloadHelper }
  interface Methods extends Playwright, Appium, FileSystem {}
  interface I extends WithTranslation<Methods> {}
  namespace Translation {
    interface Actions {}
  }
}

