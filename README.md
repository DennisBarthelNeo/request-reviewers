# Request Reviewers

Action to automatically request reviewers if the author is a member of any of the provided teams.

## Input

| Name    | Type     | Required | Description                        |
| ------- | -------- | -------- | ---------------------------------- |
| `token` | `secret` | `true`   | This is the GITHUB_TOKEN           |
| `teams` | `string` | `true`   | Comma separated list of team names |

## Example Usage

```yml
name: "Request Reviewers"

on:
  pull_request:
    types: [opened, ready_for_review]
jobs:
  request-reviewers:
    if: github.event.pull_request.draft == false
    runs-on: ubuntu-latest
    steps:
      - uses: DennisBarthelNeo/request-reviewers@v1.0
        name: Request Reviewers
        with:
          token: ${{ secrets.NEOBOT_TOKEN }}
          teams: money-mavericks,cash-cowboys,beyond-banking
```
