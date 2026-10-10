Feature: Choose the app language
  Scenario: The notebook speaks German after switching language
    Given I open a fresh notebook
    When I switch the language to German and reload
    Then the notebook is shown in German
