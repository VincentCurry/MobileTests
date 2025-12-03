@mobile @android
Feature: App Launch Tests

  @smoke @consumer
  Scenario: Open consumer app and verify it launches
    Given the "receipts-rewards" app is installed on device
    When I launch the app
    Then the app should be visible
    And I wait for 5 seconds

  @smoke @merchant
  Scenario: Open merchant app and verify it launches
    Given the "merchant" app is installed on device
    When I launch the app
    Then the app should be visible
    And I wait for 5 seconds

  @merchant @debug
  Scenario: Generate scan code and display on lock screen
    Given the "merchant" app is installed on device
    And I am a merchant logged into the merchant app
    And I have switched on updating scan codes in the settings
    When I generate a scan code in the app
    Then this scan code and the business icon is written to the lock screen
