## ESP Group One &mdash; Starter Code

Essentially this is a Typescript-all-the-way-down stack.

- ESLint is being used to lint `.ts(x)` files.
- Prettier is being used to format code.

### Requirements

- Basically just Node 20.9.0, please install via `nvm` if you haven't go that:

  For windows [install here](https://github.com/coreybutler/nvm-windows/releases).

  Once this has installed you can then open up a terminal and run:

  ```bash
  nvm install 20.9.0
  nvm use 20.9.0
  npm install -g yarn
  ```

  Then you can check the installation by going

  ```bash
  node --version
  # v20.9.0
  yarn --version
  # 1.22.19
  ```

  If it says the commands are not recognised, please check your PATH (or ask
  one of the linux users for help).

- VSCode extensions should be recommended once opening the project (we
  recommend using vscode for this as it will just be easier for node)
- Docker (with docker-compose) may be required in the future when we want to
  add the mongodb server because it would be only 1 command to start up (see
  [here](https://docs.docker.com/desktop/install/windows-install/) to download)
  but as of yet it is not required and so not finalised.

### Getting Started

1. Clone this repo: `git clone https://github.com/ESP-Number-One/MatchyoSports --recursive-submodules`

   This may ask you to log into your overleaf account as it will be cloning the
   submodules (which includes the deliverables on overleaf). Please use the
   credentials you use for that.

2. cd into the repo `cd MatchyoSports`
3. Install the dependencies (either `npm install` or `yarn install`).
4. Run the dev servers (either `npm run dev`, `yarn dev`)
5. Check out the result at http://localhost:3001

### Other useful commands

These commands should be run in the root of the project, or in `backend` and
`frontend` if you only want to run it on those respectively.

If you have the extensions for this setup correctly you should not need to run
these but if you don't want to fath with that just run the following

#### Formatting

To format all the files run:

```bash
yarn format
```

#### Linting

To get a list of the issues the linter has with your code run:

```bash
yarn lint
```

If you want to be lazy and have it fix most of the issues for you run:

```bash
yarn lint:fix
```

Note there will still be some parts which cannot be automatically fixed for
you which will be printed out.

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

This should mostly be done by prettier + eslint, but so you know

- 2 spaces as tabs
- Lines should not be longer than 80 characters (install extension)
- Trailing commas when the bracket on a new line (see below)
- NO trailing whitespaces! (Install an extension to remove it for you)
- Space after comments e.g. `// something`
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
