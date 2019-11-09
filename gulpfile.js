var gulp = require("gulp");
var exec = require("gulp-exec");
var nodemon = require("nodemon");
var browserSync = require("browser-sync").create();
var sass = require("gulp-sass");

gulp.task("sass", function() {
  return gulp.src(["public_html/scss/*.scss"])
      .pipe(sass())
       //the css desctination is in the css folder
      .pipe(gulp.dest("public_html/public/css"))
      .pipe(browserSync.stream());
});
gulp.task("nodemon", function (cb) {
    var cbCalled = false;
    return nodemon({script: "./public_html/app.js"}).on("start", function (){
        if (!cbCalled) {
          cbCalled = true;
          cb();
          console.info("Nodemon callback called successfully");
        }
    });
});

gulp.task("serve", gulp.series("nodemon"), function() {
  //proxy serves what's in the express node server
  browserSync.init(null, {
        proxy: "http://localhost:3002", // port of node server
  });
   //treat the scss file as gulp"s sass
  gulp.watch(["public_html/scss/*.scss"], ["sass"]);
  //watch all the following files
  gulp.watch("public_html/*.html")
    .on("change", browserSync.reload);
  gulp.watch("public_html/*.js")
    .on("change", browserSync.reload);
  gulp.watch("public_html/public/img/*")
    .on("change", browserSync.reload);
  gulp.watch("public_html/public/*.html")
    .on("change", browserSync.reload);
  gulp.watch("public_html/public/pages/*.html")
    .on("change", browserSync.reload);
  gulp.watch("public_html/public/js/*")
    .on("change", browserSync.reload);
  gulp.watch("public_html/public/components/*")
    .on("change", browserSync.reload);
  gulp.watch("public_html/routes/*.js")
    .on("change", browserSync.reload);
});

gulp.task("default", gulp.series("serve")); //default gulp is gulp serve
