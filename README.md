# pi-test-scope

A [pi](https://github.com/badlogic/pi-mono) extension that controls which files the agent can edit based on whether they are test files.

## Why?

Coding agents as of Feb 2026 continue to resort to updating/deleting tests when test failures block their progress. Until this isn't an issue on the model or agent harness level, this extension can be used to enter distinct modes allowing only tests to be written or _anything but_ tests to be written. This supports typical TDD-type workflows that are made even more powerful with coding agents.

## Features

- **`/notest`** - Block edits to test/spec files (toggle, or use `/notest off` to disable)
- **`/onlytest`** - Only allow edits to test/spec files (toggle, or use `/onlytest off` to disable)

## Recognized Test Patterns

- `*.test.{js,jsx,ts,tsx}`
- `*.spec.{js,jsx,ts,tsx}`
- `*_test.py`, `test_*.py`, `conftest.py`
- `__tests__/` directories
- `tests/` or `test/` directories
- `e2e/` directories

## Installation

```bash
# From npm (once published)
pi install npm:pi-test-scope

# From git
pi install git:github.com/blwsk/pi-test-scope

# Local development
pi -e ~/projects/pi-test-scope
```

## Usage

```
/notest      # Toggle: block test file edits
/notest off  # Disable protection

/onlytest      # Toggle: only allow test file edits  
/onlytest off  # Disable protection
```

A status indicator appears in the footer when a mode is active.

## License

MIT
