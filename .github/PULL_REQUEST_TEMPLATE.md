# Summary

## Motivation

## Unit Test

- [ ] `pnpm test` passes

## Manual Test

- [ ] Works correctly with Multi-session enabled, SSO user, English
  - [ ] navigationBackgroundColor is applied
    - [ ] Background color ◣ is displayed at the bottom left of the favicon
  - [ ] accountMenuButtonBackgroundColor is applied
  - [ ] accountName is displayed as `accountName (accountId)`
  - [ ] No errors are displayed in the console
- [ ] Works correctly with Multi-session enabled, IAM user, English
- [ ] Works correctly with Multi-session enabled, switched role from IAM user, English
- [ ] Works correctly with Multi-session enabled, root user, English
- [ ] Works correctly with Japanese (= non-English) language
- [ ] Options settings screen works correctly when modified
  - [ ] Error messages are displayed for incorrect account ID, regex, and color code
  - [ ] Can be saved when there are no errors
- [ ] Works correctly on both Chrome and Firefox when file names or manifest.json are modified
