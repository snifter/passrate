const gulp = require('gulp');
const del = require('del');
const path = require('path');
const pug = require('gulp-pug');
const data = require('gulp-data');
const ghPages = require('gulp-gh-pages');
const runSequence = require('run-sequence');
const sass = require('gulp-sass');

const geojson = require('./tools/gulp-geojson');
const dataPug = require('./tools/gulp-data-pug');
const common = require('./tools/common');

const browserSync = require('browser-sync').create();
const reload = browserSync.reload;

const distDirPath = './dist/';

gulp.task('template-index', () => {
    return gulp.src('./src/templates/index.pug')
        .pipe(data(() => {
            return common.listFilesInDir('./src/data/')
                .then((files) => {
                    return new Promise((resolve) => {
                        let passes = [];
    
                        files.forEach((file) => {
                            let pass = require(`./${file}`);
                            pass.slug = path.basename(file, '.json');
                            passes.push(pass);
                        });

                        resolve({passes: passes});
                    });
                });
        }))
        .pipe(pug({
            pretty: true
        }))
        .pipe(gulp.dest(distDirPath));
});

gulp.task('template-pass', () => {
    return gulp.src('./src/data/*.json')
        .pipe(dataPug('./src/templates/pass.pug'))
        .pipe(gulp.dest(distDirPath));
});

gulp.task('templates', ['template-index', 'template-pass']);

gulp.task('js', () => {
    return gulp.src('./src/js/*.js')
        .pipe(gulp.dest(`${distDirPath}js`));
});

gulp.task('images', () => {
    return gulp.src('./src/images/*')
        .pipe(gulp.dest(`${distDirPath}images`));
});

gulp.task('favicons', () => {
    return gulp.src('./src/favicons/**/*')
        .pipe(gulp.dest(`${distDirPath}favicons`));
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

gulp.task('build', ['templates', 'js', 'styles', 'geojson', 'images', 'favicons']);

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