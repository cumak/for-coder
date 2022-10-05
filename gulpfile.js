import gulp from 'gulp';
import gulpDartSass from 'gulp-dart-sass';
import sassGlob from 'gulp-sass-glob-use-forward';
import autoprefixer from 'gulp-autoprefixer';
import plumber from 'gulp-plumber';
import notify from 'gulp-notify';
import browserSync from 'browser-sync';
import gcmq from 'gulp-group-css-media-queries';

// ejs
import gulpEjs from 'gulp-ejs';
import gulpRename from 'gulp-rename';
import htmlbeautify from 'gulp-html-beautify';

// ESM JS
import gulpPluginPrettier from 'gulp-plugin-prettier';
import gulpEslint from 'gulp-eslint-new';

const baseDir = './resource';
const dist = './public';

// browserSync sync
gulp.task('browser-sync', () => {
  return browserSync.init({
    server: {
      baseDir: dist,
      index: 'index.html',
    },
    reloadOnRestart: true,
  });
});

const reload = (done) => {
  browserSync.reload();
  done();
};

const esmJs = (done) => {
  gulp
    .src([baseDir + '/js/*.ts', baseDir + '/js/*.js'])
    .pipe(
      plumber({
        errorHandler: notify.onError('<%= error.message %>'),
      })
    )
    .pipe(gulpEslint({ useEslintrc: true, fix: true }))
    .pipe(gulpEslint.fix())
    .pipe(gulpEslint.format())
    .pipe(gulpPluginPrettier.format())
    .pipe(gulp.dest(dist + '/js'));
  done();
};

const ejs = (done) => {
  gulp
    .src([baseDir + '/ejs/**/*.ejs', '!' + baseDir + '/ejs/**/_*.ejs'])
    .pipe(
      plumber({
        errorHandler: notify.onError('<%= error.message %>'),
      })
    )
    .pipe(gulpEjs({ async: true }))
    .pipe(gulpRename({ extname: '.html' }))
    .pipe(
      htmlbeautify({
        indent_size: 2,
        indent_char: ' ',
      })
    )
    .pipe(gulp.dest(dist + '/'));
  done();
};

const sass = (done) => {
  gulp
    .src(baseDir + '/sass/**/*.scss', { sourcemaps: true })
    .pipe(sassGlob())
    .pipe(
      plumber({
        errorHandler: notify.onError('<%= error.message %>'),
      })
    )
    .pipe(gulpDartSass.sync().on('error', gulpDartSass.logError))
    .pipe(gulpDartSass.sync({ outputStyle: 'expanded' }))
    .pipe(autoprefixer())
    .pipe(gcmq())
    .pipe(gulp.dest(dist + '/css'), { sourcemaps: './maps' })
    .pipe(browserSync.stream());
  done();
};

// watch
const watch = () => {
  gulp.watch(baseDir + '/sass/**/*.scss', { usePolling: true }, gulp.series('sass'));
  gulp.watch(baseDir + '/ejs/**/*.ejs', { usePolling: true }, gulp.series('ejs', 'reload'));
  gulp.watch(baseDir + '/js/**/*.{js,ts}', { usePolling: true }, gulp.series('esmJs', 'reload'));
  gulp.watch(dist + '/*.{html,php}', { usePolling: true }, gulp.series('reload'));
};

gulp.task('reload', reload);
gulp.task('esmJs', esmJs);
gulp.task('ejs', ejs);
gulp.task('sass', sass);
gulp.task('watch', watch);

//デフォルトタスク
export default gulp.parallel('browser-sync', 'watch');
