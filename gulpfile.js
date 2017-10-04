const gulp = require('gulp');
const del = require('del');
const pug = require('gulp-pug');

const browserSync = require('browser-sync').create();
const reload = browserSync.reload;

const distDirPath = './dist/';

gulp.task('templates', () => {
    gulp.src('./src/templates/*.pug')
        .pipe(pug({
            pretty: true
        }))
        .pipe(gulp.dest(distDirPath));
});

gulp.task('js', () => {
    gulp.src('./src/js/*.js')
        .pipe(gulp.dest(distDirPath));
});

gulp.task('styles', () => {
    gulp.src('./src/css/*.css')
        .pipe(gulp.dest(distDirPath));
});

gulp.task('clean', () => {
    return del(distDirPath);
});

gulp.task('build', ['templates', 'js', 'styles']);

// Static server
gulp.task('serve', ['clean', 'build'], () => {
    browserSync.init({
        server: {
            baseDir: distDirPath
        }
    });

    gulp.watch(`${distDirPath}/*`).on('change', reload);
});

gulp.task('default', ['clean', 'build']);