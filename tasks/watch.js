var gulp = require('gulp');

gulp.task('watch', ['scripts', 'styles'], function () {
    gulp.watch(['./resources/assets/js/*.js', './resources/assets/sass/*.scss'], [
      'scripts', 'styles'
    ]);
});
