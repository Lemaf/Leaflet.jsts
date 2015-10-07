var gulp = require('gulp'),
Server = require('karma').Server,
bower = require('gulp-bower')
;

gulp.task('bower', function() {
	return bower('./bower')
		.pipe(gulp.dest('lib/'))
});

gulp.task('test', ['bower'], function (done) {

	new Server({
		configFile: __dirname + '/karma.conf.js',
		singleRun: true
	}, done).start();

});