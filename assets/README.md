Building assets
===============

Requirements
------------
* Install nodejs :
    * with [binaries](https://nodejs.org/en/download/)
    * or the packet manager for your Linux distribution (e.g. Ubuntu : `sudo apt install nodejs`)
* Install dependencies :
    * `cd assets/`
    * `npm install`

It creates a `assets/node_modules/` directory. Don't commit it into the git repository!


Installation
------------
* Build for production (minified JS files) :
`npm run build`

Don't commit minified JS files into the git repository. They will be built by our
continuous integration and added into zip packages that are available on github.


* Build for development (source mapping, build is executed at every change on a JS file) :
`npm run watch`

Look at [webpack documentation](https://webpack.js.org/guides/development/) for other development options (e.g. live reloading)
