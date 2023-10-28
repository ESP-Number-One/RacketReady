# MatchyoSports

## Requirements

- [poetry](https://python-poetry.org/docs/) w/ Python 3.11
- node v20 with npm and yarn (use [`nvm`](https://github.com/nvm-sh/nvm) to
  install please - if on Windows there is a fork or something
  [here](https://github.com/coreybutler/nvm-windows), don't know how good it is
  tho)

## Installation

```sh
git clone --recurse-submodules -j8 https://github.com/ESP-Number-One/MatchyoSports.git
```

It may ask you to login to overleaf in the console, just use your credentials
for that and it should be fine.

## Contributing

- Always create your own branch + PR for any change, do NOT push to main
  branch!

  - The PR should include a brief description of the issue and link to the
    issue on the trello board

  - The PR should be reviewed by someone else before being merged and can
    contain any further discussion on there

- Git messages should always be in present tense

## Code Quality Standards

### Python

Should follow [pep-8](https://peps.python.org/pep-0008/) and parts of flake8
(however some features have been turned off by [.flake8](./.flake8) file)

Quick overview:

- 4 spaces as tabs
- `snake_case` for variables, functions and modules
- `PascalCase` for classes
- Global variables should not be used, however constants can when the are in
  `SCREAMING_CASE`.
- Lines should not be longer than 80 characters (install extension)
- Trailing commas when the bracket on a new line (see below)
- NO trailing whitespaces! (Install an extension to remove it for you)
- Space after comments e.g. `# something`
- Protected methods and attributes to start with `_`, private to start with 
  `__`
- When a variable is not used, give it the name `_` e.g.

  ```python
  for _ in range(10):
      print("Hi")

  (important_var, _) = some_func()
  ```

Personal opinion

- Try to prioritise readability of code
- Order imports alphabetically but split internal imports
- Comments should only be written when necessary, mainly to describe why
  something is done the way it is or to example a really unreadable bit of
  code (however this normally means you should change the code).
- Methods should be ordered alphabetically (with private methods ordered
  separately and at the bottom of the file) e.g.

  ```python
  def a_func():
      ...

  def b_func():
      ...

  def z_func():
      ...

  def _a_private_func():
    ...

  def _b_private_func():
    ...
  ```

- Please use statically written code when possible (only for variables when
  it's hard to tell) e.g.

  ```python
  MY_CONST: dict[str, set[list[(str|int)]]] = {
      "something": set(["hi"], [2], [3]),
  }

  def my_func(param1: int, param2: list[str]) -> (dict[str, int]|None):
      my_variable = "hi"
      ...

  def void_func():
      ...
  ```

  However note that we should try to avoid using the `str|int` type and keep to
  one type when possible.

### Using Pylint

On most ides (including vscode) you should be able to get a pylint extension to
point out and annoy you into writing okay code. Please use this as it should
help you with the above styling requirements.

### Documentation

Documentation should be for all public modules, methods, classes and functions
(however please also try to do them for private versions, but they don't have
to be as indepth).

The style of documentation is kinda whatever you want it to be, so here is a
somewhat okay layout. (Any better styles are most welcome as long as we are
consistent)

Example:

example_module.py

```python
"""
Description

Global Variables
----------------
...

Public Classes
--------------
...

Public Methods
--------------
...
"""

def my_func(param1: int) -> str:
    """Description of return which fits in less than 80 chars"""
    ...

def my_complex_func(param1: list[str]):
    """
    Description

    Parameters
    ----------
    param1 (type): Description

    Return
    ------
    brief_name (type): Description
    """

class MyClass:
  """
  Description

  Attributes
  ----------
  ...

  Public Methods
  --------------
  ...
  """

  def my_method():
    """..."""
  ...
```

### TypeScript

To be written
