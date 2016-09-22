var config      = require('../config')
if(!config.tasks.animation) return

var gulp         = require('gulp')
var imagemin     = require('gulp-imagemin')
var spritesmith  = require('gulp.spritesmith-multi')
var path         = require('path')
var count        = require('gulp-count')
var postcss      = require('gulp-postcss')
var autoprefixer = require('autoprefixer')
var cssnano      = require('cssnano')
var merge        = require('merge-stream')
var argv         = require('yargs').argv
var util         = spritesmith.util

// Post CSS settings
var processors = [
  autoprefixer(config.tasks.css.autoprefixer),
  cssnano()
];

var animationTask = function() {

  // Task settings
  var settings = {
    src: path.join(config.root.src, config.tasks.animation.src, '/**/*.{' + config.tasks.animation.extentions + '}'),
    dest: path.join(config.root.dest, config.tasks.animation.dest),
    size: config.tasks.animation.size || argv.size
  }

  // Generate a tempalte file
  var themeTemplate = util.createTemplate(
    path.join(__dirname, 'templates', 'css.hbs')
  )

  // Spritesmith options
  var opts = {
    spritesmith: function (options, sprite, icons){
      options.cssTemplate = themeTemplate,
      options.cssHandlebarsHelpers = {
        steps: icons.length,
        classname: options.imgName.replace('.png', ''),
        custom_size: size,
        half: function(number) {
          return parseInt( number / 2 )
        }
      },
      options.algorithm = 'left-right',
      options.algorithmOpts = {sort: false}

      return options
    }
  }

  // Generate the sprite
  var spriteData = gulp.src(settings.src)
    .pipe(spritesmith(opts).on('error', spritesmith.logError))

  // Process the images
  var imgStream = spriteData.img
    .pipe(imagemin().on('error', imagemin.logError))
    .pipe(gulp.dest(settings.imgDest))

  // Process the CSS
  var cssStream = spriteData.css
    .pipe(postcss(processors).on('error', postcss.logError))
    .pipe(gulp.dest(settings.cssDest))

  // Merge the streams for single 'end' event
  return merge(imgStream, cssStream)
}

gulp.task('animation', animationTask)
module.exports = animationTask
