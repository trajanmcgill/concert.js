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


			eslint:
			{
				projectStandards:
				{
					options: { configFile: "eslint.projectStandards.json" },
					src: ["src/Concert.js"]
				},

				browserAPIs_src:
				{
					options: { configFile: "eslint.browserAPIs.json" },
					src: ["src/Concert.js"]
				},

				browserAPIs_dist:
				{
					options: { configFile: "eslint.browserAPIs.json" },
					src: ["dist/Concert.js", "dist/Concert.min.js"]
				},

				browserFeatures_src:
				{
					options: { configFile: "eslint.browserFeatures.json" },
					src: ["src/Concert.js"]
				},

				browserFeatures_dist:
				{
					options: { configFile: "eslint.browserFeatures.json" },
					src: ["dist/Concert.js", "dist/Concert.min.js"]
				}
			}, // end eslint task definitions


			jsdoc:
			{
				Concert_js:
				{
					src: ["src/Concert.js"],
					options:
					{
						destination: "dist/Reference/",
						template: "node_modules/jsdoc/templates/default"
					}
				}
			},


			clean:
			{
				Concert_js: ["dist/**/*"]
			}, // end clean task definitions


			copy:
			{
				Concert_js:
				{
					files: [{ src: ["src/Concert.js"], dest: "dist/Concert.js" }],
					options: { process: function (content, srcpath) { return (grunt.config.process(LicenseBanner) + content); } }
				}
			}, // end copy task defitions

			uglify:
			{
				options: { sequences: false, verbose: true, warnings: true },

				Concert_js: { options: { banner: LicenseBanner, screwIE8: false }, src: ["src/Concert.js"], dest: "dist/Concert.min.js" },
				Concert_js_DeUglify: { options: { beautify: true }, src: ["src/Concert.min.js"], dest: "dist/Concert.min.max.js" }
			} // end uglify task definitions
		});
	
	
	// Load the plugins
	grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.loadNpmTasks("grunt-contrib-copy");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-eslint");
	grunt.loadNpmTasks("grunt-jsdoc");
	
	grunt.registerTask("clean_all", ["clean:Concert_js"]);

	grunt.registerTask("lint_src_styles", ["eslint:projectStandards"]);
	grunt.registerTask("lint_src_browserAPIs", ["eslint:browserAPIs_src"]);
	grunt.registerTask("lint_src_browserFeatures", ["eslint:browserFeatures_src"]);
	grunt.registerTask("lint_src", ["lint_src_styles", "lint_src_browserAPIs", "lint_src_browserFeatures"]);
	grunt.registerTask("lint_dist_browserFeatures", ["eslint:browserFeatures_dist"]);
	grunt.registerTask("lint_dist_browserAPIs", ["eslint:browserAPIs_dist"]);
	grunt.registerTask("lint_dist", ["lint_dist_browserAPIs", "lint_dist_browserFeatures"]);

	grunt.registerTask("build_Concert_js", ["copy:Concert_js", "uglify:Concert_js"]);
	grunt.registerTask("build_reference", ["jsdoc:Concert_js"]);
	grunt.registerTask("build_all", ["build_Concert_js", "build_reference"]);
	
	grunt.registerTask("rebuild_all", ["clean_all", "build_all"]);

	grunt.registerTask("default", ["lint_src", "rebuild_all", "lint_dist"]);
};
