const gulp = require('gulp'),
	apidoc = require('gulp-apidoc');

gulp.task('default', ['apidoc'], function (cb) {
	cb();
});

gulp.task('apidoc', function (cb) {
	apidoc({
		src: 'routes/medicine',
		dest: 'public/apidoc',
		debug: false,
		config: './',
		includeFilters: ['.*\\.js$']
	}, cb);
});

gulp.task('favicon', function (cb) {
	const https = require('https');
	const file = require('fs').createWriteStream('public/favicon.ico');
	https.get('https://s3-us-west-2.amazonaws.com/zonngoweb-images/favicon.ico', function (response) {
		response.pipe(file);
		cb();
	});
});
