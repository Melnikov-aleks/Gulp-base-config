const { src, dest, series, parallel, watch } = require('gulp');
const del = require('del');
const plumber = require('gulp-plumber');

const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');

const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const cleanCss = require('gulp-clean-css');

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
        .pipe(dest('dist'));
}

function styles() {
    return src('src/**/*.s?ss')
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(concat('main.min.css'))
        .pipe(autoprefixer())
        .pipe(cleanCss())
        .pipe(sourcemaps.write())
        .pipe(dest('dist/'));
}

function scripts() {
    return src('src/**/*.js')
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(concat('index.min.js'))
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
    return src('src/img/**/*.(png|jpg|svg|gif)')
        .pipe(plumber())
        .pipe(newer('dist/images/'))
        .pipe(imagemin())
        .pipe(dest('dist/images/'));
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

function watching() {
    watch('src/**/*.html', series(html)).on('change', sync.reload);
    watch('src/**/*.s?ss', series(styles)).on('change', sync.reload);
    watch('src/**/*.js', series(scripts)).on('change', sync.reload);
    watch('src/img/**/*.(png|jpg|svg|gif)', series(images)).on('change', sync.reload);
}

exports.clear = clear;
exports.delImg = delImg;
exports.default = series(clear, parallel(html, styles, scripts, images), serve, watching);
