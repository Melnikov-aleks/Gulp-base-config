const { src, dest, series, parallel, watch } = require('gulp');
const del = require('del');
const plumber = require('gulp-plumber');
const gulpIf = require('gulp-if');

const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const flatten = require('gulp-flatten');

const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const cleanCss = require('gulp-clean-css');
const tildeImporter = require('node-sass-tilde-importer');

const htmlmin = require('gulp-htmlmin');

const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');

const babel = require('gulp-babel');
const uglify = require('gulp-uglify');

const sync = require('browser-sync').create();

function checkName(file) {
    return file.stem == 'index' ? true : false;
}

function html() {
    return src('src/**/*.html')
        .pipe(plumber())
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulpIf(checkName, flatten()))
        .pipe(dest('dist'));
}

function styles() {
    return src('src/**/*.s{a,c}ss')
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(
            sass({
                importer: tildeImporter,
            })
        )
        .pipe(concat('styles.min.css'))
        .pipe(autoprefixer())
        .pipe(cleanCss())
        .pipe(sourcemaps.write())
        .pipe(dest('dist/'))
        .pipe(sync.stream());
}

function scripts() {
    return src('src/**/*.js')
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(concat('scripts.min.js'))
        .pipe(
            babel({
                presets: ['@babel/env'],
            })
        )
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(dest('dist/'));
}

function images() {
    return src('src/img/**/*.{png,jpg,svg,gif}')
        .pipe(plumber())
        .pipe(newer('dist/images/'))
        .pipe(imagemin())
        .pipe(dest('dist/images/'));
}

function moveFavicons() {
    return src('src/favicons/*').pipe(dest('dist/'));
}

function delImg() {
    return del('dist/images/**');
}

function clear() {
    return del('dist');
}

function serve(cb) {
    sync.init({
        server: './dist',
        open: true,
    });
    cb();
}

function reload(cb) {
    sync.reload();
    cb();
}

function watching() {
    watch('src/**/*.html', series(html, reload));
    watch('src/**/*.s{a,c}ss', series(styles));
    watch('src/**/*.js', series(scripts, reload));
    watch('src/img/**/*.{png,jpg,svg,gif}', series(images, reload));
}

exports.clear = clear;
exports.img = series(delImg, images);
exports.default = series(
    clear,
    parallel(html, styles, scripts, images, moveFavicons),
    serve,
    watching
);
