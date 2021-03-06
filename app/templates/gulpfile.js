'use strict';

var gulp = require('gulp'),
    gutil = require('gulp-util'),
    jade = require('gulp-jade'),
    stylus = require('gulp-stylus'),
    rename = require('gulp-rename'),
    remark = require('gulp-remark'),
    frontMatter = require('gulp-gray-matter'),
    remarkHtml = require('remark-html'),
    attachToTemplate = require('gulp-attach-to-template'),
    dateInPath = require('stratic-date-in-path'),
    postsToIndex = require('stratic-posts-to-index'),
    paginateIndexes = require('stratic-paginate-indexes'),
    addsrc = require('gulp-add-src'),
    ecstatic = require('ecstatic'),
    ghpages = require('gh-pages'),
    path = require('path'),
    http = require('http');

gulp.task('build', ['build:html', 'build:css', 'build:js', 'build:blog']);
gulp.task('build:blog', ['build:blog:posts', 'build:blog:index']);

gulp.task('build:html', function() {
	return gulp.src('src/*.jade')
	           .pipe(jade({ pretty: true, basedir: __dirname }))
	           .pipe(rename({ extname: '.html' }))
	           .pipe(gulp.dest('dist'));
});

gulp.task('build:blog:posts', function() {
	return gulp.src('src/blog/*.md')
	           .pipe(frontMatter({property: ''}))
	           .pipe(remark({quiet: true}).use(remarkHtml))
	           .pipe(dateInPath())
	           .pipe(addsrc('src/blog/post.jade'))
	           .pipe(attachToTemplate('post.jade'))
	           .pipe(jade({ pretty: true, basedir: __dirname }))
	           .pipe(rename({ extname: '.html' }))
	           .pipe(gulp.dest('dist/blog'));
});

gulp.task('build:blog:index', function() {
	return gulp.src('src/blog/*.md')
	           .pipe(frontMatter({property: ''}))
	           .pipe(remark({quiet: true}).use(remarkHtml))
	           .pipe(dateInPath())
	           .pipe(addsrc('src/blog/index.jade'))
	           .pipe(postsToIndex('index.jade'))
	           .pipe(paginateIndexes())
	           .pipe(jade({ pretty: true, basedir: __dirname }))
	           .pipe(rename({ extname: '.html' }))
	           .pipe(gulp.dest('dist/blog'));
});

gulp.task('build:css', function() {
	return gulp.src('src/styles/*.styl')
	           .pipe(stylus())
	           .pipe(rename({ extname: '.css' }))
	           .pipe(gulp.dest('dist/css'));
});

gulp.task('build:js', function() {
	return gulp.src('src/scripts/*.js')
	           .pipe(gulp.dest('dist/js'));

});

gulp.task('lint', ['lint:html', 'lint:css', 'lint:js']);

gulp.task('lint:html', [''], function() {
	// TODO
});

gulp.task('lint:css', [''], function() {
	// TODO
});

gulp.task('lint:js', [''], function() {
	// TODO
});

gulp.task('deploy', ['build'], function(done) {
	ghpages.publish(path.join(__dirname, 'dist'), { logger: gutil.log, branch: 'master' }, done);
});

gulp.task('serve', ['watch'], function() {
	http.createServer(
		ecstatic({ root: __dirname + '/dist' })
	).listen(process.env.PORT || 8080);
});

gulp.task('watch', ['build'], function() {
	gulp.watch(['src/*.jade', 'src/includes/*.jade'], ['build:html', 'build:blog:posts', 'build:blog:index']);
	gulp.watch('src/styles/*.styl', ['build:css']);
	gulp.watch('src/scripts/*.js', ['build:js']);
	gulp.watch('src/blog/*.md', ['build:blog']);
	gulp.watch('src/blog/*.jade', ['build:blog:posts', 'build:blog:index']);
});
