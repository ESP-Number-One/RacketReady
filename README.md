# MatchyoSports

This is the mono repo for everything with this project because its nicely
organised

## Requirements

You probably want to research into each of these to actually understand what
each of their purposes are.

- node v20 with npm and yarn (use [`nvm`](https://github.com/nvm-sh/nvm) to
  install please - if on Windows there is a fork or something
  [here](https://github.com/coreybutler/nvm-windows), don't know how good it is
  tho)
- [docker](https://www.docker.com/) if you want to have some fun with it
- [vite](https://vitejs.dev)

## Installation

To be updated once the final system has been designed

```sh
# It may ask you to login to overleaf in the console when cloning, just use your
# credentials for that and it should be fine.
git clone --recurse-submodules -j8 https://github.com/ESP-Number-One/MatchyoSports.git
cd MatchyoSports
cd frontend
yarn install
cd ../backend
yarn install
```

## Usage

This is likely to change as we add more requirements + secrets

### Docker

TODO: Implement live reloading

```sh
docker build -t matchyosports:latest .
docker run --rm -p 8080:8080 matchyosports:latest
```

## Contributing

- Always create your own branch + PR for any change, do NOT push to main
  branch!

  - The PR should include a brief description of the issue and link to the
    issue on the trello board

  - The PR should be reviewed by someone else before being merged and can
    contain any further discussion on there

- Git messages should always be in present tense

## Code Quality Standards

### Overview

- 4 spaces as tabs
- Lines should not be longer than 80 characters (install extension)
- Trailing commas when the bracket on a new line (see below)
- NO trailing whitespaces! (Install an extension to remove it for you)
- Space after comments e.g. `# something` or `// something`
- Try to prioritise readability of code
- Order imports alphabetically but split internal imports
- Prefer documentation over comments (see below on how you do that)
- Comments should only be written when necessary, mainly to describe why
  something is done the way it is or to example a really unreadable bit of
  code (however this normally means you should change the code).
- Methods should be ordered alphabetically (with private methods ordered
  separately and at the bottom of the file) e.g. in python:

  ```js
  function a_func() {}
  function b_func() {}
  function z_func() {}
  function _a_private_func() {}
  function _b_private_func() {}
  ```

#### Use a Linter

Linters usually will catch most issues, these can be installed as extensions to
your preferred editor. E.g. for TypeScript we will be
using [ESLint](https://eslint.org/)

### Specifically

- We are using `.tsx` over `.ts` files for a reason, go look up the difference
- `camelCase` for variables + functions
- `PascalCase` for classes
- `SCREAMING_CASE` for global constants
- Use `const` FIRST and if you need to reassign the variable use `let`.
  Constants in JavaScript + TypeScript are NOT constant, they just can't be
  reassigned (stupid ik)
- Reduce use of `Any` - however TypeScript can be quite dumb at times so can be
  used for type conversion.
- Prefer `'` over `"` for strings, unless you have `'` inside the string
- Starting a new scope with `{` should be on the same line, not on a new line,
  e.g. in javascript:

  ```js
  function something(my_arg) {
      ...
  }

  // NOT
  function something(my_arg)
  {
      ...
  }
  ```

- Else + else if statements should be on the same line as the scope (ignore the
  lecturers preferences for this).

  ```js
  if (myVar === 'Something') {
    ...
  } else if (myOtherVar !== 'THING') {
    ...
  } else {
    ...
  }

  // NOT
  if (myVar === 'Something') {
    ...
  }
  else if (myOtherVar !== 'THING') {
    ...
  }
  else {
    ...
  }
  ```

- Prefer creating your own interface over using the `object` keyword
- ESLint basically covers all my other issues

#### Documentation

TypeScript + JavaScript have actually good documentation (probably the only
good thing about them), so please use it.

Basically please read through
[this](https://gamedevacademy.org/javascript-docstrings-tutorial/).
