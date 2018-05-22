var gulp = require("gulp");
var browserSync = require("browser-sync").create();
var sass = require("gulp-sass");

gulp.task("sass", function() {
  return gulp.src(["public_html/scss/*.scss"])
      .pipe(sass())
       //the css desctination is in the css folder
      .pipe(gulp.dest("public_html/css"))
      .pipe(browserSync.stream());
});

gulp.task("serve", function() {
  browserSync.init({
      server: "./public_html"
  });
   //treat the scss file as gulp"s sass
  gulp.watch(["public_html/scss/*.scss"], ["sass"]);
  gulp.watch("public_html/*.html").on("change", browserSync.reload);
  gulp.watch("public_html/pages/*.html").on("change", browserSync.reload);
  gulp.watch("public_html/img").on("change", browserSync.reload);
});

gulp.task("default", ["serve"]); //default gulp is gulp serve
