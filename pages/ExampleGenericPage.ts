import { ButtonLabels, FilterOptions, SortOptions } from '../enums';

const { I } = inject();

/**
 * Example Generic Page Object
 * Shows how to use enums for type-safe string values
 * Replace with actual page objects for your application
 */
class ExampleGenericPage {
  async clickButton(label: ButtonLabels) {
    await I.click(`button:has-text("${label}")`);
  }

  async applyFilter(option: FilterOptions) {
    await I.click('[data-testid="filter-dropdown"]');
    await I.click(`[data-filter="${option}"]`);
  }

  async selectSort(sort: SortOptions) {
    await I.click('[data-testid="sort-dropdown"]');
    await I.click(`text="${sort}"`);
  }

  async verifyButtonVisible(label: ButtonLabels) {
    await I.seeElement(`button:has-text("${label}")`);
  }
}

export = new ExampleGenericPage();
