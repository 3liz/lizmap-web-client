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

Installation
------------
* Build for production (minified JS files) :
`npm run build`

* Build for development (source mapping, build is executed at every change on a JS file) :
`npm run watch`

Look at [webpack documentation](https://webpack.js.org/guides/development/) for other development options (e.g. live reloading)
