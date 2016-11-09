# Contribution guidelines

## Branches

* New features are developped in **master** branch
* **release_X_Y** branches are created for each stable version, for example release_3_0 for Lizmap 3.0
* Bug fixes must land on the ***last release branch**, for example **release_3_0**. We regularly merge the last release branch in the master branch. No cherry-pick must be done from master into the release branch

## Commits

* Commit messages must be written with care. First line of the message is short and allows a quick comprehension. A description can be written after a line break if more text is needed..
* Related issues must be written in the commit message. Be aware Github can close related issues when using some words: https://help.github.com/articles/closing-issues-via-commit-messages/
* A keyword can be used to prefix the commit and describe the type of commit, between brackets like [FEATURE] or [BUGFIX]

For example

```
[FEATURE] New super feature to make coffea #123456789

This allows the user to request coffea:
* with sugar
* long or regular
```

## Issues


