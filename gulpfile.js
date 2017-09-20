const gulp        = require('gulp');
const browserSync = require('browser-sync').create();
const reload      = browserSync.reload;

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