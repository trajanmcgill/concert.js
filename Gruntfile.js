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

	var ESModuleFooter = "export const Concert = __Concert_PublicInterface;";

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

				browserAPIs_dist_standard:
				{
					options: { configFile: "eslint.browserAPIs.json" },
					src: ["dist/Concert.js", "dist/Concert.min.js"]
				},

				browserAPIs_dist_ESModule:
				{
					options: { configFile: "eslint.browserAPIs.ESModule.json" },
					src: ["dist/Concert.mjs", "dist/Concert.min.mjs"]
				},

				browserFeatures_src:
				{
					options: { configFile: "eslint.browserFeatures.json" },
					src: ["src/Concert.js"]
				},

				browserFeatures_dist_standard:
				{
					options: { configFile: "eslint.browserFeatures.json" },
					src: ["dist/Concert.js", "dist/Concert.min.js"]
				},

				browserFeatures_dist_ESModule:
				{
					options: { configFile: "eslint.browserFeatures.ESModule.json" },
					src: ["dist/Concert.mjs", "dist/Concert.min.mjs"]
				}
			}, // end eslint task definitions


			jsdoc:
			{
				Concert:
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
				assembly: ["assembly/**/*"],
				dist: ["dist/**/*"]
			}, // end clean task definitions


			copy:
			{
				standard:
				{
					files: [{ src: ["assembly/Concert.js"], dest: "dist/Concert.js" }],
					options:
					{
						process: function (content, srcpath) { return (grunt.config.process(LicenseBanner) + content); }
					}
				},
				ESModule:
				{
					files: [{ src: ["assembly/Concert.mjs"], dest: "dist/Concert.mjs" }],
					options:
					{
						process: function (content, srcpath) { return (grunt.config.process(LicenseBanner) + content + ESModuleFooter); }
					}
				}
			}, // end copy task defitions


			preprocess:
			{
				standard:
				{
					files: [{ src: ["src/Concert.js"], dest: "assembly/Concert.js" }],
					options: { context: { } }
				},

				ESModule:
				{
					files: [{ src: ["src/Concert.js"], dest: "assembly/Concert.mjs" }],
					options: { context: { ES_MODULE: true } }
				}
			}, // end preprocess task defitions
			

			uglify:
			{
				options: { sequences: false, verbose: true, warnings: true },

				standard:
				{
					files:
					[
						{ src: ["dist/Concert.js"], dest: "dist/Concert.min.js" }
					],
					options: { banner: LicenseBanner, screwIE8: false },
				},

				ESModule:
				{
					files:
					[
						{ src: ["assembly/Concert.mjs"], dest: "dist/Concert.min.mjs" }
					],
					options: { banner: LicenseBanner, footer: ESModuleFooter },
				}
			} // end uglify task definitions
		});
	
	
	// Load the plugins
	grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.loadNpmTasks("grunt-contrib-copy");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-eslint");
	grunt.loadNpmTasks("grunt-jsdoc");
	grunt.loadNpmTasks("grunt-preprocess");
	
	grunt.registerTask("clean_all", ["clean:assembly", "clean:dist"]);

	grunt.registerTask("lint_src_styles", ["eslint:projectStandards"]);
	grunt.registerTask("lint_src", ["lint_src_styles", "eslint:browserAPIs_src", "eslint:browserFeatures_src"]);
	grunt.registerTask(
		"lint_dist",
		[
			"eslint:browserAPIs_dist_standard","eslint:browserAPIs_dist_ESModule",
			"eslint:browserFeatures_dist_standard", "eslint:browserFeatures_dist_ESModule"
		]);

	grunt.registerTask("preprocess_all", ["preprocess:standard", "preprocess:ESModule"]);

	grunt.registerTask("copy_all", ["copy:standard", "copy:ESModule"]);

	grunt.registerTask("uglify_all", ["uglify:standard", "uglify:ESModule"]);

	grunt.registerTask("build_Concert", ["preprocess_all", "copy_all", "uglify_all"]);
	grunt.registerTask("build_reference", ["jsdoc:Concert"]);
	grunt.registerTask("build_all", ["build_Concert", "build_reference"]);
	
	grunt.registerTask("rebuild_all", ["clean_all", "build_all"]);

	grunt.registerTask("default", ["lint_src", "rebuild_all", "lint_dist"]);
};
