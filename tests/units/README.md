Unit tests for Lizmap
=====================

A unit tests should be added each time you fix a bug or provide a new feature / API.

- `testslib` directory: where classes inheriting from Lizmap classes or new classes
  for tests are stored.
  No need to do a `require`. These classes are autoloaded, if their name ends
  with `ForTests`.
- `tmp`: use this directory to store temporary content for your tests
- Other directories : they contain tests.
