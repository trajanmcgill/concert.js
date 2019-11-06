# Concert.js
- Easy synchronized animation with JavaScript.


## Table of Contents
***
- [Introduction](#introduction)
- [Using Concert.js](#using-concertjs)
- [License](#license)
- [Bug Reports and Suggested Enhancements](#bug-reports-and-suggested-enhancements)
- [Contributing to Concert.js](#contributing-to-concertjs)
- [Authors](#authors)
- [Version History](#version-history)

## Introduction
***
NOTE (2019-10-14): This project, which was dormant for several years, is currently in the process of being imported/migrated to GitHub and optimized for modern browsers. Not everything is present here yet, nor on the project's main web site, which is also being reworked. It is recommended to wait until a release beyond the 1.0-alpha series before making use of this code on a production site. The code is in an essentially functional state, however, and testing and playing with it is welcome and invited.

### What is Concert.js?
Concert.js is a JavaScript component for easily defining sequences of changes to CSS styles, DOM objects, or anything else that can be manipulated with JavaScript, and playing these sequences or synchronizing them with media playback, user interaction, or your own components. In short, it animates things, and if you want, it will precisely synchronize those animations with other things.

### What can it do, and why should I use it?
(ADD examples here)

### Getting Started
- For a very basic overview, see [Using Concert.js](#using-concertjs) below.
- For detailed info, including demos, FAQ, tutorial, reference docs, and more, visit the project web site at [www.concertjs.com](http://www.concertjs.com/).

## Using Concert.js
- Prerequisites
    - Browser Compatibility: Concert.js works well on older browsers. (ADD detailed compatibility info here.)
- Setup
    - **If you want to add it to your project using npm:**

		From within your project directory, run:
		```
		npm install concert.js --save-dev
		```
		(Or without the `--save-dev` if you want the concert.js package installed as a regular dependency instead of a dev dependency of your project.)
	- **If you just want to download the thing and go:**
        - Download needed files from [releases page](https://github.com/trajanmcgill/concert.js/releases).
		    - `Concert.js` - The only file you really need, human-readable version.
			- `Concert.min.js` - The only file you really need, minified version.
			- `Reference.zip` - Reference documentation for Concert.js, in HTML form.
			- Or you can click on either of the "Source Code" links to grab all the files in the project in either .zip or .tar.gz form.
- Basic Usage
    - Add `Concert.min.js` as a script to your web page (or the full `Concert.js` if you want to use an un-minified version, e.g. for development and debugging).
    - Animate! Concert.js is very simple and intuitive. See this [introductory tutorial](http://www.concertjs.com/tutorial.html) for the basics of putting it into action.
- Reference Documentation
    - For a full description of all the elements of the Concert.js library, see the [reference page](http://www.concertjs.com/Components/Concert.js/1.0.0/Reference/index.html).

## License
***
Concert.js is available for use under the [MIT License](LICENSE). Copyright belongs to Trajan McGill.

## Bug Reports and Suggested Enhancements
***
Visit the [project issues page](https://github.com/trajanmcgill/concert.js/issues) to offer suggestions or report bugs.

## Contributing to Concert.js
***
(Or just messing around with and building the code yourself)
- Prerequisites
    - [git](https://git-scm.com/)
    - [npm](https://www.npmjs.com/)
- Setup
	1. First, clone from GitHub:
		```
		git clone https://github.com/trajanmcgill/concert.js.git
		```
	2. Next, to get all the dependencies (the linting, build, and reference documentation generator tools) and run an initial build process, move inside the newly created project directory and run:
		```
		npm install
		```
- Working folders and files:
	- `design` directory has some design notes files.
	- `dist` directory is created by the build process, and contains all the distributable files, including both the Concert.js library and the auto-generated documentation web pages.
	- `docTemplates` contains template files for jsdoc to use when auto-generating reference documentation from the comments in the source code.
	- `node_modules` is created by npm, and contains tools used in the build process.
    - `src` directory contains all the source code.
	- `tests` has a few web pages used for testing functionality of the library.
- Building:
    - This project is built using [Grunt](https://gruntjs.com/). Additionally, as part of that process, reference documentation is auto-generated from comments in the source code using [grunt-jsdoc](https://github.com/krampstudio/grunt-jsdoc), which is a Grunt wrapper around [jsdoc](https://jsdoc.app/). Building Concert.js does not require installing any npm packages globally.
    - In the project directory:
	    ```
	    node node_modules/grunt-cli/bin/grunt
	    ```
	    This will kick off a [Grunt](https://gruntjs.com/) script that will:
	    1. Run the code-linting tool [JSHint](https://jshint.com/) against the source.
	    2. Clean out the `dist` folder.
	    3. Copy the full source and a minified version (created with [UglifyJS](https://github.com/mishoo/UglifyJS2)) to the `dist` folder.
	    4. Run [jsdoc](https://jsdoc.app/) on the source code, generating a set of reference documentation pages for all the classes, methods, and other elements in the source. Output is deposited in `dist/Reference`.
- Contributing changes:

    There is not presently a formal document describing contributions to this project. If you want to add functionality or fix bugs, please at least pay attention to the coding style that is evident in the existing source. Thanks.
## Authors
***
[Trajan McGill](https://github.com/trajanmcgill)

## Version History
***
See [releases page](https://github.com/trajanmcgill/concert.js/releases) for version notes and downloadable assets.