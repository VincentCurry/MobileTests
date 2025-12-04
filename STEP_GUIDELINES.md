# BDD Step Definition Guidelines

Guidelines for writing Gherkin steps and implementing step definitions in this mobile testing framework.

## Project Architecture

### Step Definition Location
Step definitions are located in Page Object folders:
```
pageObjects/
├── common/
│   └── app.page.ts              # Shared app lifecycle actions
└── merchantPO/
    ├── merchant.steps.ts        # Step definitions
    ├── merchant.page.ts         # Page actions
    ├── merchant.locators.ts     # Element locators
    └── merchant.utils.ts        # Utilities (OCR, QR)
```

### Step Definition Pattern
Steps should only call Page Object methods - no logic in step files:

```typescript
// merchant.steps.ts - CORRECT
Given('I am a merchant logged into the merchant app', async () => {
  await MerchantPage.login();
});

// INCORRECT - Don't put logic in steps
Given('I am a merchant logged into the merchant app', async () => {
  await I.fillField(emailField, email);  // Don't do this
  await I.click(loginButton);            // Logic belongs in Page Object
});
```

## Step Writing Rules

### First-Person Active Voice
All steps use **"I [verb]"** format from the user's perspective.

### Given (Preconditions)
Set up initial state:
- `Given the "merchant" app is installed on device`
- `Given I am a merchant logged into the merchant app`
- `Given I have switched on updating scan codes in the settings`

### When (Actions)
User actions:
- `When I launch the app`
- `When I generate a scan code in the app`
- `When I tap the settings icon`

### Then (Assertions)
Verify outcomes:
- `Then the app should be visible`
- `Then this scan code and the business icon is written to the lock screen`
- `Then I see the login screen`

## Current Steps Reference

### App Lifecycle (common/app.page.ts)
| Step | Description |
|------|-------------|
| `the {string} app is installed on device` | Setup and reset app |
| `I launch the app` | Launch current app |
| `the app should be visible` | Verify app is in foreground |
| `I wait for {int} seconds` | Static wait |

### Merchant App (merchantPO/merchant.steps.ts)
| Step | Description |
|------|-------------|
| `I am a merchant logged into the merchant app` | Login with credentials from .env |
| `I have switched on updating scan codes in the settings` | Enable QR lock screen setting |
| `I generate a scan code in the app` | Generate QR code |
| `this scan code and the business icon is written to the lock screen` | Verify lock screen content |

## Parameters

### String Parameters `{string}`
```gherkin
Given the "merchant" app is installed on device
When I enter "test@email.com" in the email field
```

### Integer Parameters `{int}`
```gherkin
Then I wait for 5 seconds
```

## Example Scenario

```gherkin
@merchant @debug
Scenario: Generate scan code and display on lock screen
  Given the "merchant" app is installed on device
  And I am a merchant logged into the merchant app
  And I have switched on updating scan codes in the settings
  When I generate a scan code in the app
  Then this scan code and the business icon is written to the lock screen
```

## Adding New Steps

1. **Add step definition** in appropriate `*.steps.ts` file
2. **Implement logic** in corresponding `*.page.ts` file
3. **Add locators** in `*.locators.ts` if needed
4. **Keep steps atomic** - one action per step

## Test Tags

| Tag | Usage |
|-----|-------|
| `@mobile` | All mobile tests |
| `@android` | Android-specific |
| `@merchant` | Merchant app tests |
| `@consumer` | Consumer app tests |
| `@smoke` | Quick verification |
| `@debug` | Development/debugging |

## VS Code Setup

### Cucumber Extension
Install "Cucumber (Gherkin) Full Support" extension for:
- Step autocomplete
- Go to step definition
- Syntax highlighting

### Troubleshooting Steps Not Found
1. Reload VS Code: `Ctrl+Shift+P` → "Reload Window"
2. Check `.vscode/settings.json` has correct step paths
3. Close and reopen feature files
