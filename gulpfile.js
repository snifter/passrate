const gulp = require('gulp');
const del = require('del');
const pug = require('gulp-pug');

const geojson = require('./tools/gulp-geojson');

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

gulp.task('geojson', () => {
    gulp.src('./src/data/*.json')
        .pipe(geojson('passes.json'))
        .pipe(gulp.dest(`${distDirPath}json/`))
});

gulp.task('clean', () => {
    del(distDirPath);
});

gulp.task('build', ['templates', 'js', 'styles', 'geojson']);

// Static server
gulp.task('serve', ['clean', 'build'], () => {
    browserSync.init({
        server: {
            baseDir: distDirPath
        }
    });

    gulp.watch(`${distDirPath}*`).on('change', reload);
});

gulp.task('default', ['clean', 'build']);