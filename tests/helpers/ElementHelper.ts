const { I } = inject();

class ElementHelper {
  async waitAndClick(locator: string, timeout?: number): Promise<void> {
    if (timeout) {
      await I.waitForElement(locator, timeout);
    } else {
      await I.waitForElement(locator);
    }
    await I.click(locator);
  }

  async waitAndVerify(locator: string, timeout?: number): Promise<void> {
    if (timeout) {
      await I.waitForElement(locator, timeout);
    } else {
      await I.waitForElement(locator);
    }
    await I.seeElement(locator);
  }

  async clickMultiple(locator: string, maxAttempts: number = 5, timeoutPerAttempt: number = 1): Promise<void> {
    for (let i = 0; i < maxAttempts; i++) {
      const count = await I.grabNumberOfVisibleElements(locator);
      
      if (count === 0) {
        console.log(`✓ Element became invisible after ${i} attempt(s)`);
        return;
      }
      
      await I.click(locator);
      
      try {
        await I.waitForInvisible(locator, timeoutPerAttempt);
        console.log(`✓ Element became invisible after ${i + 1} click(s)`);
        return;
      } catch {
        // Element still visible, try again
      }
    }
    
    console.log(`⚠️  Element still visible after ${maxAttempts} attempts`);
  }
}

export = new ElementHelper();
