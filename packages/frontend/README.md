# Frontend

The frontend is built in [React](https://react.dev/) and
[Vite](https://vitejs.dev/).

You will notice there is a `components` folder in `src`, this is where all the
components should go (snake case file names) with their own files for each
thing. Unless they are simple and make sense to group.

If you feel it would be better organised with another subfold, please add. We
love organisation.

## React

Note that as you will be designing components without the actual use case just
yet you will need to understand some parts of React to make sure the components
are implemented correctly and so we don't have to change them later on.

Hopefully the PR reviewer will catch this before it is merged so you can learn.

But the main concept you will need to understand is states. See
[here](https://react.dev/learn/managing-state) for the documentation on that.

This means that if you have a button or input that needs to pass its value to
a form submission of the page, you need to pass the setter and sometimes even
the value itself depending on whether it changes the look or not.

You will then need to create the state in the test page to test it works
correctly.

## Tailwindcss

[Tailwindcss](https://tailwindcss.com/) is an extremely barebones css library,
that basically allows you to nearly do anything you would do in css in classes.

Meaning NO css files PLEASE.

Resources you may want to use:

- docs can be found [here](https://tailwindcss.com/docs/utility-first) which
  are good for translating raw css and looking at the concepts
- [flowbite](https://flowbite.com/docs/components/buttons/) then has some full
  implemented systems which are good for seeing how you can add classes
  together to produce a result. Their examples are also accessible which is
  good

Also I personally recommend you to `flex` instead of `grid` as it is more
powerful and normally does everything slightly better.

### Adding custom colours

As mentioned [here](https://tailwindcss.com/docs/customizing-colors), you can
add new colours in the `tailwindcss.config.js` and they can be used by going
`bg-<colour>` or `text-<colour>` in the classes.

I have already added some colours from the prototype so go check them out.

### Adding custom fonts

You can also add custom font families as shown
[here](https://tailwindcss.com/docs/font-family), again by editing the
`tailwindcss.config.js`. If the font has a space in the name you will need to
surround with `'"Font name"'`.

Note however you will have to add a link in the `index.html`, preferably with
the [google fonts link](https://fonts.google.com/). Also note you will have
to match the google font with the weight which can be changed as shown
[here](https://tailwindcss.com/docs/font-weight)

I have already added some fonts so also go check them out!

## Testing

TBD
