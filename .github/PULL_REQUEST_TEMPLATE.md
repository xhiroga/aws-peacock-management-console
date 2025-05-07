# Summary

## Motivation

## Unit Test

- [ ] `yarn test` passes

## Manual Test

- [ ] Works correctly with SSO user, Multi-session enabled, English
  - [ ] navigationBackgroundColor is applied
    - [ ] Background color ◣ is displayed at the bottom left of the favicon
  - [ ] accountMenuButtonBackgroundColor is applied
  - [ ] accountName is displayed as `accountName (accountId)`
  - [ ] No errors are displayed in the console
- [ ] Works correctly with SSO user, Multi-session disabled, English
  - [ ] accountName is displayed as `userName @ accountName`
- [ ] Works correctly with IAM user, Multi-session enabled, English
- [ ] Works correctly with IAM user, Multi-session disabled, English
- [ ] Works correctly with switched role from SSO user, Multi-session disabled, English
- [ ] Works correctly with switched role from IAM user, Multi-session disabled, English
- [ ] Works correctly with root user, Multi-session enabled, English
- [ ] Works correctly with root user, Multi-session disabled, English
- [ ] Works correctly with Japanese (= non-English) language
- [ ] Options settings screen works correctly when modified
  - [ ] Error messages are displayed for incorrect account ID, regex, and color code
  - [ ] Can be saved when there are no errors
- [ ] Works correctly on both Chrome and Firefox when file names or manifest.json are modified
