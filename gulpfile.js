const { src, dest, watch, series } = require('gulp');

const postcss = require('gulp-postcss'),
      autoprefixer = require('gulp-autoprefixer'),
      cssnano = require('cssnano'),
      sass = require('gulp-sass')(require('sass')),
      sassGlob = require('gulp-sass-glob-import'),
      terser = require('gulp-terser'),
      concat = require('gulp-concat'),
      imagemin = require('gulp-imagemin'),
      imagewebp = require('gulp-webp'),
      del = require('del'),
      browserSync = require('browser-sync').create();

let paths = {
  dist: 'dist',
  twig: 'src/pages/home.twig',
  fonts: 'src/assets/fonts',
  jquery: 'src/assets/js/jquery.min.js',
  css: {
    src: 'src/main.scss',
    dest: 'dist/css'
  },
  js: {
    src: 'src/**/!(*.min)*.js',
    dest: 'dist/js'
  },
  img: {
    src: 'src/assets/images/*.{jpg,jpeg,png}',
    dest: 'dist/images'
  }
}

// Watch Twig
function watchTwig() {
  return src(paths.twig)
    .pipe(browserSync.stream());
}

// Sass Task
function scssTask() {
  return src(paths.css.src, { sourcemaps: true })
    .pipe(sassGlob())
    .pipe(sass())
    .pipe(autoprefixer('last 2 versions'))
    .pipe(postcss([cssnano()]))
    .pipe(dest(paths.css.dest, { sourcemaps: '.' }))
    .pipe(browserSync.stream());
};

// JavaScript Task
function jsTask() {
  return src(paths.js.src, { sourcemaps: true })
    .pipe(terser())
    .pipe(concat('bundle.js'))
    .pipe(dest(paths.js.dest, { sourcemaps: '.' }))
    .pipe(browserSync.stream());
};

// Transfer JQuery
function jqTransfer() {
  return src(paths.jquery)
    .pipe(dest(`${paths.dist}/js`));
}

// Images Task
function optimizeImage() {
  return src(paths.img.src)
    .pipe(imagemin([
      imagemin.mozjpeg({ quality:80, progressive: true }),
      imagemin.optipng({ optimizationLevel: 2 })
    ]))
    .pipe(dest(paths.img.dest));
};

// Webp Convert Task
function webpConvert() {
  return src(paths.img.src)
  .pipe(imagewebp())
  .pipe(dest(paths.img.dest));
};

// Transfer fonts
function fontsTransfer() {
  return src(paths.fonts)
    .pipe(dest(paths.dist));
}

// Watch Task
function watchTask() {
  watch('src/**/*.scss', scssTask);
  watch('src/**/*.js', jsTask);
  watch('src/**/*.twig', jsTask);
  watch(paths.img.src, optimizeImage);
  watch(`${paths.img.dest}/*.{jpg,jpeg,png}`, webpConvert);
};

// Clean Task
function cleanTask() {
  return del(paths.dist);
};

// Browsersync Tasks
function browserSyncServe(cb) {
  browserSync.init({
    proxy: "localhost:8000",
    open: false
  });
  cb();
};

function browserSyncReload(cb) {
  browserSync.reload();
  cb();
};

// Development Server
exports.dev = series(
  cleanTask,
  watchTwig,
  scssTask,
  jsTask,
  jqTransfer,
  fontsTransfer,
  browserSyncServe,
  browserSyncReload,
  optimizeImage,
  webpConvert,
  watchTask
);

// Build
exports.build = series(
  cleanTask,
  scssTask,
  jsTask,
  jqTransfer,
  fontsTransfer,
  optimizeImage,
  webpConvert
);

// Clean dist folder
exports.clean = cleanTask;