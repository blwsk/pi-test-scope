# pi-test-scope

A [pi](https://github.com/badlogic/pi-mono) extension that controls which files the agent can edit based on whether they are test files.

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
