'use strict';

import gulp from 'gulp'
import autoprefixer from 'autoprefixer'
import del from 'del'
import nodemon from 'gulp-nodemon'
import cssnano from 'cssnano'
import image from 'gulp-image'
import size from 'gulp-size'
import newer from 'gulp-newer'
import sourcemaps from 'gulp-sourcemaps'
import stylus from 'gulp-stylus'
import postcss from 'gulp-postcss'
import browserSync from 'browser-sync';
import babel from 'gulp-babel';
import concat from 'gulp-concat';
import uglify from 'gulp-uglify';

const reload = browserSync.reload;

// Optimize images -
// if problem https://github.com/tcoopman/image-webpack-loader/issues/95

gulp.task('images', (cb) => {
	gulp.src('app/images/**/*')
	.pipe(newer('.tmp/images'))
	.pipe(gulp.dest('.tmp/images'))
	.pipe(image())
	.pipe(gulp.dest('dist/images'))
	.pipe(size({title: 'images'}));
	cb();
});


// Compile and automatically prefix stylesheets
gulp.task('stylus', (cb) => {
		const plugins = [
			autoprefixer(),
			cssnano(),
			require("postcss-flexbugs-fixes")
		];
		// For best performance, don't add Sass partials to `gulp.src`
		gulp.src('app/stylus/**/main.styl')
		.pipe(newer('.tmp/styles'))
		.pipe(sourcemaps.init())
		.pipe(stylus())
		.pipe(postcss(plugins))
		.pipe(gulp.dest('.tmp/styles'))
		// Concatenate and minify styles
		.pipe(size({title: 'stylus'}))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest('dist/styles'))
		.pipe(gulp.dest('.tmp/styles'))
		.pipe(browserSync.stream());
		cb();
});

// Concatenate and minify JavaScript
gulp.task('scripts', (cb) => {
	gulp.src([
		// Note: Since we are not using useref in the scripts build pipeline,
		//       you need to explicitly list your scripts here in the right order
		//       to be correctly concatenated
		'./app/scripts/main.js'
		// Other scripts
	])
	.pipe(newer('.tmp/scripts'))
	.pipe(sourcemaps.init())
	.pipe(babel())
	.pipe(sourcemaps.write())
	.pipe(gulp.dest('.tmp/scripts'))
	.pipe(concat('main.min.js'))
	.pipe(uglify())
	// Output files
	.pipe(size({title: 'scripts'}))
	.pipe(sourcemaps.write('.'))
	.pipe(gulp.dest('dist/scripts'))
	.pipe(gulp.dest('.tmp/scripts'));
	cb();
});

gulp.task('clean', () => del(['.tmp/*', '!.tmp/images', 'dist/*', '!dist/.git'], {dot: true}));

gulp.task('cleanTMPPhotos', () => del(['.tmp/images'], {dot: true}));


// Copy all files at the root level (app)
gulp.task('copy', () =>
	gulp.src([
		'app/**',
		'!app/images'
	], {
		dot: true
	}).pipe(gulp.dest('dist'))
	.pipe(size({title: 'copy'}))
);

const compile = gulp.parallel('stylus', 'images', 'scripts');
const cleanAll = gulp.parallel('clean', 'cleanTMPPhotos');
// Build production files, the default task
gulp.task('default', gulp.series(cleanAll, compile));


gulp.task('nodemon', (cb) => {
	let called = false;
	nodemon({
		script: './app/app.js',
		watch: ['./app/views/**/*.pug', './app/app.js'],
		"legacyWatch": true,
		ignore: [
			'gulpfile.babel.js',
			'node_modules/'
		]
	})
	.on('start', () => {
		console.log("start");

		if(!called) {
			called = true;
			cb();
		}
	})
	.on('restart', () => {
		console.log("restart");

		reload();
		cb();
	})
});

// Watch files for changes & reload
gulp.task('serve', gulp.series('default', 'nodemon', (done) => {
	console.log("SERVE");
	browserSync.init(null, {
		proxy: "http://localhost:5000",
		notify: true,
		// Customize the Browsersync console logging prefix
		logPrefix: 'WSK',
		open: false,
		// Run as an https by uncommenting 'https: true'
		// Note: this uses an unsigned certificate which on first access
		//       will present a certificate warning in the browser.
		// https: true,
		port: 3000
	});

	gulp.watch("app/stylus/**/*.styl", gulp.series('stylus'));
	gulp.watch('app/images/**/*', gulp.series('images'));
	gulp.watch(['app/scripts/**/*.js'], gulp.series(['scripts', reload]));
	gulp.watch('app/views/**/*.pug').on('change', reload);

	done()
}));
