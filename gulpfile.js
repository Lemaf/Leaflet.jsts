var gulp = require('gulp'),
Server = require('karma').Server,
bower = require('gulp-bower'),
concat = require('gulp-concat'),
uglify = require('gulp-uglify'),
rename = require('gulp-rename'),
del = require('del'),
jshint = require('gulp-jshint')
;

gulp.task('clean:dist', function() {
	return del(['./dist/**/*.js']);
});

gulp.task('bower', function() {
	return bower()
		.pipe(gulp.dest('lib/'))
});

gulp.task('jshint', function() {
	return gulp.src(['./src/**/*.js'])
		.pipe(jshint())
		.pipe(jshint.reporter('default'))
		.pipe(jshint.reporter('fail'));
});

gulp.task('concat:js', ['jshint', 'clean:dist'], function() {

	return gulp.src([
		'src/L.jsts.js',
		'src/mixin/*.js',
		'src/L.Jsts.js',
		'src/ext/*.js'
	])
	.pipe(concat('leaflet.jsts.js'))
	.pipe(gulp.dest('./dist/'));

});

gulp.task('uglify:js', ['concat:js'], function() {
	return gulp.src('./dist/*.js')
	.pipe(rename(function(path) {
		path.extname = '-min.js';
	}))
	.pipe(uglify())
	.pipe(gulp.dest('./dist'));
});

gulp.task('test', ['bower', 'concat:js'], function (done) {

	new Server({
		configFile: __dirname + '/karma.conf.js',
		singleRun: true
	}, done).start();

});

gulp.task('build', ['uglify:js']);