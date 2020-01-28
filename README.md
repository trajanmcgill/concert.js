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

### What is Concert.js?
Concert.js is a JavaScript component for easily defining sequences of changes to CSS styles, DOM objects, or anything else that can be manipulated with JavaScript, and playing these sequences or synchronizing them with media playback, user interaction, or your own components. In short, it animates things, and if you want, it will precisely synchronize those animations with other things.

### Why would I want to use this particular animation library?
Some of the things that make Concert.js handy include:
- It is easy to work into your code, whatever your project structure. Concert.js supports simple script tag inclusion or any of the common module formats (AMD, CommonJS, and even ES Modules)
- It has intuitive syntax that is quick to learn and implement.
- Animation sequences are defined in ways which allow them to be easily programmatically generated and manipulated. Throw together an array of keyframes and positions, or an array of individual movement segments, whichever is easier for the job at hand, and drop it into the sequence object. Clone animations onto different targets. Create them before the objects they apply to even exist.
- One place Concert.js shines as compared to some other methods of animating is when you need synchronization. Want to manipulate the DOM in time with video, audio, or other animations happening simultaneously? No problem. Concert.js is highly optimized for very quick seek times, even with large numbers of items being animated, and its animations remain locked to their time source (whether that is the system clock or something else, such as an html video element). No more setting two things in motion at the same time and only hoping they stay running at the same rate all the way to the end.
- An MIT License means you can use it how you want.
- All the usual things you'd expect (e.g., assorted easing functions), and some things you might not, like rotational motion and animation of colors (including transparency).
- The easy-to-use animation engine can easily be applied to new things. Custom functions are supported for calculating complex values or applying them to any sort of target.

### Getting Started
- For a very basic overview, see [Using Concert.js](#using-concertjs) below.
- For detailed info, including demos, FAQ, tutorial, reference docs, and more, visit the project web site at [www.concertjs.com](https://www.concertjs.com/).

## Using Concert.js
- Prerequisites
    - Browser Compatibility: Concert.js should work well on almost any browser currently in use. Presently, the code is linted against a feature and API set going back to major browser versions from roughly 2011.
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
		    - `Concert.mjs` - Same as Concert.js, but as an ES Module.
			- `Concert.min.mjs` - Same as Concert.min.js, but as an ES Module.
			- `Reference.zip` - Reference documentation for Concert.js, in HTML form.
			- Or you can click on either of the "Source Code" links to grab all the files in the project in either .zip or .tar.gz form.
- Basic Usage
    - Add `Concert.min.js` as a script to your web page (or the full `Concert.js` if you want to use an un-minified version, e.g. for development and debugging). Or include it with whatever module system you use.
    - Animate! Concert.js is very simple and intuitive. See this [introductory tutorial](https://www.concertjs.com/tutorial01.html) for the basics of putting it into action.
- Reference Documentation
    - For a full description of all the elements of the Concert.js library, see the [reference page](https://www.concertjs.com/Reference/index.html).

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
	- `assembly` directory is created by the build process, and contains intermediate build files.
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
		
		There are also shortcuts to the above: scripts called `build` and `build.cmd`, for the bash and cmd or Powershell environments, respectively, which simply run the node command above and pass to it any specified arguments.
- Contributing changes:

    There is not presently a formal document describing contributions to this project. If you want to add functionality or fix bugs, please at least pay attention to the coding style that is evident in the existing source. Thanks.
## Authors
***
[Trajan McGill](https://github.com/trajanmcgill)

## Version History
***
See [releases page](https://github.com/trajanmcgill/concert.js/releases) for version notes and downloadable assets.
