module.exports = function(grunt)
{
	var LicenseBanner = 
		"/*! <%= pkg.name %> <%= pkg.version %>\r\n"
		+ " * <%= pkg.homepage %>\r\n"
		+ " *\r\n"
		+ " * <%= pkg.custom_CopyrightNotice %>\r\n"
		+ " * <%= pkg.custom_LicenseDescription %>\r\n"
		+ " * <%= pkg.custom_LicenseURL %>\r\n"
		+ " */\r\n";


	// Project configuration.
	grunt.initConfig(
		{
			pkg: grunt.file.readJSON("package.json"),


			jshint:
			{
				options:
				{
					bitwise: true, browser: true, curly: false, eqeqeq: true, forin: true, immed: true, latedef: true, laxbreak: true, laxcomma: true, newcap: true,
					noarg: true, noempty: true, nonew: true, quotmark: "double", smarttabs: true, strict: true, trailing: true, undef: true, unused: true, validthis: true
				},

				Concert_js: { src: ["Concert.js/Source/Concert.js"] }
			}, // end jshint task definitions


			clean:
			{
				Concert_js: ["Concert.js/Build/**/*"]
			}, // end clean task definitions


			copy:
			{
				Concert_js:
				{
					files: [{ src: ["Concert.js/Source/Concert.js"], dest: "Concert.js/Build/Concert.js" }],
					options: { process: function (content, srcpath) { return (grunt.config.process(LicenseBanner) + content); } }
				}
			}, // end copy task defitions


			buildReferenceDocs:
			{
				Concert_js:
				{
					sourceFile: "Concert.js/Source/Concert.js",
					destination: "Concert.js/Build/Reference",
					template: "Concert.js/DocTemplates/ConcertJS"
				}
			},

			uglify:
			{
				options: { sequences: false, verbose: true, warnings: true },

				Concert_js: { options: { banner: LicenseBanner }, src: ["Concert.js/Source/Concert.js"], dest: "Concert.js/Build/Concert.min.js" },
				Concert_js_DeUglify: { options: { beautify: true }, src: ["Concert.js/Build/Concert.min.js"], dest: "Concert.js/Build/Concert.min.max.js" }
			} // end uglify task definitions
		});
	
	
	// Load the plugins
	grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.loadNpmTasks("grunt-contrib-copy");
	grunt.loadNpmTasks("grunt-contrib-cssmin");
	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	
	// Define tasks
	grunt.registerMultiTask(
		"buildReferenceDocs",
		"Run jsdoc to create documentation files",
		function ()
		{
			var sourceFile = this.data.sourceFile, destination = this.data.destination, template = this.data.template;
			grunt.log.write("Running jsdoc\r\n    file:" + sourceFile + "\r\n    template:" + template + "\r\n    output path:" + destination + "\r\n");
			var done = this.async();
			grunt.util.spawn(
				{
					cmd: "jsdoc.bat",
					args: ["--template", template, "--destination", destination, sourceFile],
					opts: { stdio: "pipe" }
				},
				function (error, result, code)
				{
					if (error !== null || (result.stderr && result.stderr !== ""))
					{
						grunt.fail.warn("Error encountered attempting to run jsdoc: " + result.stderr);
						done(false);
					}
					else
						done();
				});
		}); // end call to grunt.registerMultiTask("buildReferenceDocs"...)

	grunt.registerTask("lint_all", ["jshint:ConcertJS"]);
	grunt.registerTask("clean_all", ["clean:ConcertJS"]);
	grunt.registerTask("build_ConcertJS", ["copy:ConcertJS", "uglify:ConcertJS"]);
	grunt.registerTask("build_reference", ["buildReferenceDocs:ConcertJS"]);
	grunt.registerTask("build_all", ["build_ConcertJS", "build_reference"]);
	grunt.registerTask("rebuild_all", ["clean_all", "build_all"]);
	grunt.registerTask("default", ["lint_all", "rebuild_all"]);
};
