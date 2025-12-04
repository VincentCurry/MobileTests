/// <reference path="../global.d.ts" />

const { I } = inject();

/**
 * Appium-specific helper utilities for element interactions and assertions
 */
class AppiumHelper {
  
  // ============ Wait Utilities ============
  
  async waitForMinimumElements(locator: string, minCount: number, timeout: number = 10): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout * 1000) {
      const count = await I.grabNumberOfVisibleElements(locator);
      if (count >= minCount) {
        return;
      }
      await I.wait(0.5);
    }
    
    const actualCount = await I.grabNumberOfVisibleElements(locator);
    throw new Error(`Timeout: Expected at least ${minCount} elements, found ${actualCount}`);
  }

  async waitForElementCountBetween(
    locator: string, 
    minCount: number, 
    maxCount: number, 
    timeout: number = 10
  ): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout * 1000) {
      const count = await I.grabNumberOfVisibleElements(locator);
      if (count >= minCount && count <= maxCount) {
        return;
      }
      await I.wait(0.5);
    }
    
    const actualCount = await I.grabNumberOfVisibleElements(locator);
    throw new Error(`Timeout: Expected ${minCount}-${maxCount} elements, found ${actualCount}`);
  }

  async waitAndClick(locator: string, timeout: number = 10): Promise<void> {
    await I.waitForElement(locator, timeout);
    await I.click(locator);
  }

  async waitAndVerify(locator: string, timeout: number = 10): Promise<void> {
    await I.waitForElement(locator, timeout);
    await I.seeElement(locator);
  }

  // ============ Assertion Utilities ============

  async assertElementCount(locator: string, expectedCount: number, elementName: string = 'elements'): Promise<void> {
    const count = await I.grabNumberOfVisibleElements(locator);
    
    if (count !== expectedCount) {
      throw new Error(`Expected ${expectedCount} ${elementName}, but found ${count}`);
    }
    
    console.log(`✓ Found ${count} ${elementName}`);
  }

  async assertMinimumElementCount(locator: string, minCount: number, elementName: string = 'elements'): Promise<void> {
    const count = await I.grabNumberOfVisibleElements(locator);
    
    if (count < minCount) {
      throw new Error(`Expected at least ${minCount} ${elementName}, but found ${count}`);
    }
    
    console.log(`✓ Found ${count} ${elementName} (minimum: ${minCount})`);
  }

  async assertElementTextContains(locator: string, expectedText: string, elementName: string = 'Element'): Promise<void> {
    const actualText = await I.grabTextFrom(locator);
    
    if (!actualText.includes(expectedText)) {
      throw new Error(
        `${elementName} text mismatch:\n` +
        `Expected to contain: "${expectedText}"\n` +
        `Actual text: "${actualText}"`
      );
    }
    
    console.log(`✓ ${elementName} contains "${expectedText}"`);
  }

  async assertElementTextEquals(locator: string, expectedText: string, elementName: string = 'Element'): Promise<void> {
    const actualText = (await I.grabTextFrom(locator)).trim();
    const expectedTrimmed = expectedText.trim();
    
    if (actualText !== expectedTrimmed) {
      throw new Error(
        `${elementName} text mismatch:\n` +
        `Expected: "${expectedTrimmed}"\n` +
        `Actual: "${actualText}"`
      );
    }
    
    console.log(`✓ ${elementName} text equals "${expectedText}"`);
  }

  // ============ Element Utilities ============

  async isElementPresent(locator: string): Promise<boolean> {
    const count = await I.grabNumberOfVisibleElements(locator);
    return count > 0;
  }

  async getElementCount(locator: string): Promise<number> {
    return await I.grabNumberOfVisibleElements(locator);
  }

  async getElementText(locator: string): Promise<string> {
    return await I.grabTextFrom(locator);
  }

  async isTextPresent(text: string): Promise<boolean> {
    try {
      await I.see(text);
      return true;
    } catch {
      return false;
    }
  }
}

export = new AppiumHelper();
