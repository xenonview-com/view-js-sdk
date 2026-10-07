# Xenon Web Rules

## Primary goal
Provide the implementation for both the Xenon Lab Shopify app and the website.

## Secondary goal
This is a production code base, it is crucial to keep it clean from bugs by keeping quality high.

### Guidance:
- For all created files, make sure to do a final pass after passing the tests to refactor, paying attention to SOLID coding methodology.
- using yarn duplication find and eliminate duplication
- using yarn complexity keep all functions below 2 complexity
- keep ESlint clean.
- Use mockito to mock out complex dependencies in test files
- For all code added make sure corresponding test is added in test file

#### Coding conventions:
- We us object orient programming following SOLID principals, always take those into account when coding

#### testing/code coverage
- implement unit tests for every change
- make sure coverage for altered code is 100%

#### when committing
- git commit all changes with commit message summarizing changes as a headline
- construct the rest of the git message per the guidelines
##### git commit message guidelines
- For each commit, the detailed message should be a session decision log.
- Each session decision log should include:
  - the user's prompts for the session or change
  - the context gathered
  - implementation decisions
  - code changes
  - verification results
- Keep one session decision log per commit.
- If a commit is amended or renamed before it is created, update the session decision log in the commit as appropriate.
