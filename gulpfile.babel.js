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

// const server = browserSync.create();
// function reload(done) {
// 	server.reload();
// 	done();
// }

const reload = browserSync.reload;

// Optimize images -
// if problem https://github.com/tcoopman/image-webpack-loader/issues/95

function images(done) {
		gulp.src('app/images/**/*')
			.pipe(newer('.tmp/images'))
			.pipe(gulp.dest('.tmp/images'))
			.pipe(image())
			.pipe(gulp.dest('dist/images'))
			.pipe(size({title: 'images'}));
		reload();
		done();
}

// Compile and automatically prefix stylesheets
function stylusTask(done) {
		const plugins = [
			autoprefixer(),
			cssnano()
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
		done();
}

function nodemonTask(cb) {
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
			return cb();
		}
	})
	.on('restart', () => {
		console.log("restart");

		reload()
		return cb();
	});
}


gulp.task('clean', () => {
	console.log("CLEANING");
	return del(['.tmp/*', '!.tmp/images', 'dist/*', '!dist/.git']);
});

gulp.task('cleanTMPPhotos', () => {
	return del(['.tmp/images']);
});
//
// const stylusWatch = () => gulp.watch('app/stylus/**/*.styl').on('change', gulp.series(stylusTask, reload));
// const imageWatch = () => gulp.watch('app/images/**/*').on('change', gulp.series(images, reload));


// const watchAll = gulp.parallel(stylusWatch, imageWatch);
const compile = gulp.parallel(stylusTask, images);
const cleanAll = gulp.parallel('clean', 'cleanTMPPhotos');
// Build production files, the default task
gulp.task('default', gulp.series(cleanAll, compile));

// Watch files for changes & reload
gulp.task('serve', gulp.series('default', nodemonTask, (done) => {
	console.log("SERVE");
	browserSync.init(null, {
		proxy: "http://localhost:5000",
		notify: true,
		// Customize the Browsersync console logging prefix
		logPrefix: 'WSK',
		// Run as an https by uncommenting 'https: true'
		// Note: this uses an unsigned certificate which on first access
		//       will present a certificate warning in the browser.
		// https: true,
		port: 3000
	});

	gulp.watch("app/stylus/**/*.styl", stylusTask);
	gulp.watch('app/images/**/*', images);
	gulp.watch('app/views/**/*.pug').on('change', reload);

	done()
}));
