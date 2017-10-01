const gulp        = require('gulp');
const browserSync = require('browser-sync').create();
const reload      = browserSync.reload;

const pug = require('gulp-pug');

gulp.task('templates', () => {
    return gulp.src('./src/templates/*.pug')
        .pipe(pug({
            pretty: true
        }))
        .pipe(gulp.dest('dist'));
});

// Static server
gulp.task('serve', () => {
    browserSync.init({
        server: {
            baseDir: './src/'
        }
    });

    gulp.watch('./src/index.html').on('change', reload);
    gulp.watch('./src/js/*.js').on('change', reload);
    gulp.watch('./src/json/*.json').on('change', reload);
});