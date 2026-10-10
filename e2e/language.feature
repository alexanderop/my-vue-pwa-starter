Feature: Choose the app language
  Scenario: Switching to German applies at once and is remembered
    Given I open a fresh notebook
    When I switch the language to German
    Then the notebook is shown in German without reloading
    When I reload the notebook
    Then the notebook is still shown in German

  Scenario: System follows a German browser
    Given I open a fresh notebook
    Then a German browser shows the notebook in German without a stored choice
