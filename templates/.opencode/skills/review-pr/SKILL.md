---
name: Review PR
description: Review a pull request diff for correctness, security and missing tests
---

## Workflow

1. Read the diff (`git diff main...HEAD`).
2. List findings in severity order with file:line.
3. Check: correctness, security, missing tests.
4. End with MERGE or FIX-FIRST + re-verify command.
