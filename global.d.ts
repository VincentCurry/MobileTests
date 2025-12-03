/// <reference path="./steps.d.ts" />

declare const I: CodeceptJS.I;

declare function inject(): {
  I: CodeceptJS.I;
  waitHelper: typeof import('./tests/helpers/WaitHelper');
  clickHelper: typeof import('./tests/helpers/ClickHelper');
  assertionHelper: typeof import('./tests/helpers/AssertionHelper');
  navigationHelper: typeof import('./tests/helpers/NavigationHelper');
  elementHelper: typeof import('./tests/helpers/ElementHelper');
  searchHelper: typeof import('./tests/helpers/SearchHelper');
  downloadHelper: typeof import('./tests/helpers/DownloadHelper');
};

declare function locate(selector: string): CodeceptJS.LocatorOrString;
declare function tryTo(fn: () => void | Promise<void>): Promise<boolean>;
declare function Given(title: string, callback: Function): void;
declare function When(title: string, callback: Function): void;
declare function Then(title: string, callback: Function): void;
