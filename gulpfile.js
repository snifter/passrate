const gulp = require('gulp');
const del = require('del');
const pug = require('gulp-pug');
const ghPages = require('gulp-gh-pages');
const runSequence = require('run-sequence');
const sass = require('gulp-sass');

const geojson = require('./tools/gulp-geojson');

const browserSync = require('browser-sync').create();
const reload = browserSync.reload;

const distDirPath = './dist/';

gulp.task('templates', () => {
    return gulp.src('./src/templates/*.pug')
        .pipe(pug({
            pretty: true
        }))
        .pipe(gulp.dest(distDirPath));
});

gulp.task('js', () => {
    return gulp.src('./src/js/*.js')
        .pipe(gulp.dest(distDirPath));
});

gulp.task('styles', function() {
    return gulp.src("./src/scss/*.scss")
        .pipe(sass())
        .pipe(gulp.dest(distDirPath))
        .pipe(browserSync.stream());
});

gulp.task('geojson', () => {
    return gulp.src('./src/data/*.json')
        .pipe(geojson('passes.json'))
        .pipe(gulp.dest(`${distDirPath}json/`))
});

gulp.task('clean', () => {
    return del([distDirPath]);
});

gulp.task('build', ['templates', 'js', 'styles', 'geojson']);

gulp.task('deploy', () => {
    return gulp.src(`${distDirPath}**/*`)
        .pipe(ghPages());    
});

gulp.task('serve', () => {
    return runSequence(
        'clean',
        'build',
        'watch'
    );
});

gulp.task('browser-sync', () => {
    return browserSync.init({
        server: {
            baseDir: distDirPath
        }
    });    
});

gulp.task('watch', ['browser-sync'], () => {
    gulp.watch('./src/templates/**/*', ['templates']);
    gulp.watch('./src/js/**/*', ['js']);
    gulp.watch('./src/scss/**/*', ['styles']);
    return gulp.watch([
        `${distDirPath}**/*`, 
        `!${distDirPath}**/*.css`])
        .on('change', reload);
});

gulp.task('default', () => {
    return runSequence('clean', 'build');
});