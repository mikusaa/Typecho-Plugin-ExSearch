var gulp = require('gulp');
var sass = require('gulp-sass')(require('sass'));
var prefix = require('gulp-autoprefixer').default;
var minify = require('gulp-clean-css');
var rev = require('gulp-rev').default;
var revCollector = require('gulp-rev-collector');
var uglify = require('gulp-uglify');
var del = require('del');
var prefixerOptions = {
    overrideBrowserslist: ['last 2 versions']
};

// 删除旧版与临时文件
gulp.task('clean', function () {
    return del.deleteAsync(['build', 'temp']);
});

// CSS 编译与打包
gulp.task('pack:css', function () {
    return gulp.src('./assets/ExSearch.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(prefix(prefixerOptions))
        .pipe(minify())
        .pipe(rev())
        .pipe(gulp.dest('./build/assets/'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('./temp/rev/css'));
});

// 主 JS 压缩混淆
gulp.task('pack:js', function () {
    return gulp.src('./assets/ExSearch.js')
        .pipe(uglify())
        .pipe(rev())
        .pipe(gulp.dest('./build/assets/'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('temp/rev/js'));
});

// 静态文件加戳
gulp.task('md5', function () {
    return gulp.src(['temp/rev/**/*.json', './*.php'])
        .pipe(revCollector())
        .pipe(gulp.dest('./build/'));
});

// 无需处理的文件
gulp.task('move', function () {
    gulp.src(['./assets/iconfont*'])
        .pipe(gulp.dest('./build/assets/'));
    gulp.src('./cache/.gitignore')
        .pipe(gulp.dest('./build/cache/'));
    return gulp.src(['./LICENSE', './README.md'])
        .pipe(gulp.dest('./build/'));
});

gulp.task('default', gulp.series('clean', gulp.parallel('pack:css', 'pack:js'), 'md5', 'move'));
