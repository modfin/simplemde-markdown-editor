"use strict";

var gulp = require("gulp"),
	// minifycss = require("gulp-clean-css"),
	// uglify = require("gulp-uglify"),
	concat = require("gulp-concat"),
	header = require("gulp-header"),
	buffer = require("vinyl-buffer"),
	pkg = require("./package.json"),
	debug = require("gulp-debug"),
	eslint = require("gulp-eslint"),
	// prettify = require("gulp-jsbeautifier"),
	browserify = require("browserify"),
	source = require("vinyl-source-stream"),
	rename = require("gulp-rename"),
	watch = require("gulp-watch"),
    browserSync = require('browser-sync').create();

var banner = ["/**",
	" * <%= pkg.name %> v<%= pkg.version %>",
	" * Copyright <%= pkg.company %>",
	" * @link <%= pkg.homepage %>",
	" * @license <%= pkg.license %>",
	" */",
	""].join("\n");

var css_files = [
	"./node_modules/codemirror/lib/codemirror.css",
	"./src/css/*.css",
	"./node_modules/codemirror-spell-checker/src/css/spell-checker.css"
];

gulp.task("lint", function() {
	gulp.src("./src/js/**/*.js")
		.pipe(debug())
		.pipe(eslint())
		.pipe(eslint.format());
	// .pipe(eslint.failAfterError());
});

function taskBrowserify(opts) {
	return browserify("./src/js/simplemde.js", opts)
		.bundle();
}

gulp.task("browserify:debug", ["lint"], function() {
	return taskBrowserify({debug:true, standalone:"SimpleMDE"})
		.pipe(source("simplemde.debug.js"))
		.pipe(buffer())
		.pipe(header(banner, {pkg: pkg}))
		.pipe(gulp.dest("./debug/"));
});

gulp.task("browserify", ["lint"], function() {
	return taskBrowserify({standalone:"SimpleMDE"})
		.pipe(source("simplemde.js"))
		.pipe(buffer())
		.pipe(header(banner, {pkg: pkg}))
		.pipe(gulp.dest("./debug/"));
});
// "browserify:debug"
gulp.task("scripts", ["browserify"], function() {
	var js_files = ["./debug/simplemde.js"];

	return gulp.src(js_files)
		.pipe(concat("simplemde.min.js"))
		// .pipe(uglify())
		.pipe(buffer())
		.pipe(header(banner, {pkg: pkg}))
		.pipe(gulp.dest("./dist/"));
});

gulp.task("scripts-watch", ["scripts"], function(done) {
	browserSync.reload();
	done();
});

gulp.task("styles", function() {
	return gulp.src(css_files)
		.pipe(concat("simplemde.css"))
		// .pipe(buffer())
		// .pipe(header(banner, {pkg: pkg}))
		// .pipe(gulp.dest("./debug/"))
		// .pipe(minifycss())
		.pipe(rename("simplemde.min.css"))
		.pipe(buffer())
		.pipe(header(banner, {pkg: pkg}))
		.pipe(gulp.dest("./dist/"));
});

gulp.task("styles-watch", ["styles"], function(done) {
	browserSync.reload();
	done();
});

// Static Server + watching scss/html files
gulp.task("serve", [], function() {
	browserSync.init({
		server: "./dist"
	});

	gulp.watch(css_files, ["styles-watch"]);
	gulp.watch("./src/js/**/*.js", ["scripts-watch"]);
	gulp.watch("dist/*.html").on("change", browserSync.reload);
});

gulp.task("default", ["scripts", "styles", "serve"]);

// TODO add clean task (delete dist) before serving/building