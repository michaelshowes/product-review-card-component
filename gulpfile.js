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
      twig = require('gulp-twig'),
      browserSync = require('browser-sync').create(),
      merge = require('gulp-merge-json'),
      data = require('gulp-data'),
      fs = require('fs');
      $ = require('gulp-load-plugins');

const root = 'src',
      dist = 'dist'

const paths = {
  twig: `${root}/pages/index.twig`,
  fonts: `${root}/assets/fonts/*`,
  jquery: `${root}/assets/js/jquery.min.js`,
  css: {
    src: `${root}/main.scss`,
    dest: `${dist}/css`
  },
  js: {
    src: `${root}/**/!(*.min)*.js`,
    dest: `${dist}/js`
  },
  json: `${root}/**/*.json`,
  img: {
    src: `${root}/assets/images/*.{jpg,jpeg,png}`,
    dest: `${dist}/images`
  }
}

// Twig Compile Task
function twigTask() {
  return src(paths.twig)
    .pipe(data(function(file) {
      return JSON.parse(fs.readFileSync(`${root}/data/data.json`));
    }))
    .pipe(twig({
      namespaces: {
        'components': `${root}/components`,
        'partials': `${root}/components/_partials`,
        'svg': `${root}/components/_svg`
      }
    }))
    .pipe(dest(dist))
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

// JSON Merge Task
function mergeJson() {
  return src(paths.json)
    .pipe(merge({
      fileName: 'data.json',
      jsonSpace: '  '
    }))
    .pipe(dest(`${root}/data`))
    .pipe(browserSync.stream());
}

// Transfer JQuery
function jqTransfer() {
  return src(paths.jquery)
    .pipe(dest(`${dist}/js`));
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
    .pipe(dest(`${dist}/fonts`));
}

// Watch Task
function watchTask() {
  watch(`${root}/**/*.scss`, scssTask);
  watch(`${root}/**/*.js`, jsTask);
  watch(`${root}/**/*.twig`, twigTask);
  watch(`${root}/**/*.json`, mergeJson);
  watch(paths.img.src, optimizeImage);
  watch(paths.fonts, fontsTransfer);
  watch(`${paths.img.dest}/*.{jpg,jpeg,png}`, webpConvert);
};

// Clean Task
function cleanTask() {
  return del(dist);
};

// Browsersync Tasks
function browserSyncServe(cb) {
  browserSync.init({
    server: {
      baseDir: dist
    },
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
  twigTask,
  scssTask,
  jsTask,
  mergeJson,
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
  twigTask,
  scssTask,
  jsTask,
  mergeJson,
  jqTransfer,
  fontsTransfer,
  optimizeImage,
  webpConvert
);

// Clean dist folder
exports.clean = cleanTask;