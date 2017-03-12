var gulp = require('gulp'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    cssnano = require('gulp-cssnano'),
    maps = require('gulp-sourcemaps'),
    htmlmin = require('gulp-htmlmin'),
    responsive = require('gulp-responsive'),
    imagemin = require('gulp-imagemin');


// Working directories
var bases = {
    src: 'src/',
    dist: 'dist/'
};


// Paths to files
var paths = {
    html: ['index.html'],
    styles: ['scss/app.scss'],
    bootstrapDir: ['bower_components/bootstrap-sass'],
    assets: ['assets'],
    images: ['assets/images/**/*.jpg'],
    logo: ['assets/logo/logo.svg']
}


// HTML
gulp.task('minifyHTML', function() {
    gulp.src(paths.html, { cwd: bases.src })
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest(bases.dist))
});


// Compile scss
gulp.task('buildCSS', function() {
    gulp.src(paths.styles, { cwd: bases.src })
        .pipe(maps.init())
        .pipe(sass({
            outputStyle: 'expanded',
            //where to import files from
            includePaths: [paths.bootstrapDir + '/assets/stylesheets/'],
            precision: 8
        }).on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: [
                "Android 2.3",
                "Android >= 4",
                "Chrome >= 20",
                "Firefox >= 24",
                "Explorer >= 8",
                "iOS >= 6",
                "Opera >= 12",
                "Safari >= 6"
            ],
            cascade: false
        }))
        .pipe(cssnano())
        .pipe(maps.write('./'))
        .pipe(gulp.dest(bases.dist + '/css/'))

});


// Make responsive images, output in src
gulp.task('resizeImages', function() {
    return gulp.src(paths.assets + '/original/**/*', { cwd: bases.src })
        .pipe(responsive({
            // Resize all JPG images
            '*.jpg': [{
                width: 600,
                rename: { suffix: '-600' },
            }, {
                width: 800,
                rename: { suffix: '-800' },
            }, {
                width: 1000,
                rename: { suffix: '-1000' },
            }]
        }, {
            // Global configuration for all images
            // The output quality for JPEG, WebP and TIFF output formats
            quality: 85,
            // Use progressive (interlace) scan for JPEG and PNG output
            progressive: true,
            // Strip all metadata
            withMetadata: false,
        }))
        .pipe(gulp.dest(bases.src + '/assets/images/'));
});


// Optimize svg, output in dist
gulp.task('svg', function() {
    gulp.src([paths.assets + '/logo/logo.svg'], { cwd: bases.src })
        .pipe(imagemin([imagemin.svgo({ plugins: [{ removeViewBox: false }] })]))
        .pipe(gulp.dest(bases.dist + 'assets/logo/'));
});


// Copy and move images to build folder
gulp.task('copyImages', ['resizeImages'], function() {
    gulp.src(paths.images, { cwd: bases.src })
        .pipe(gulp.dest(bases.dist + '/assets/images/'));
});


// Watch tasks. Rerun the task when a file changes
gulp.task('watch', function() {
    gulp.watch(bases.src + "/scss/**/*.scss", ['buildCSS']);
    gulp.watch(bases.src + "/*.html", ['minifyHTML']);
    gulp.watch(bases.src + "assets/original/**/*", ['copyImages']);
    gulp.watch(bases.src + "assets/logo/**/*", ['svg']);

})


// Build
gulp.task('build', ['copyImages', 'svg', 'buildCSS', 'minifyHTML'], function(done) {
    console.log("Page is built");
    done();
});

//Default task
gulp.task('default', ['watch', 'build']);
