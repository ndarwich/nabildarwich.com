$(window).on("load", function() {
  loadNavigation(4);
  loadBooks();
  $("body").on("click", ".book", (e) => {
    e.preventDefault(); //don't scroll up
    openBook(e);
  });
});

loadBooks = () => {
  const bookTypes = ["text", "image", "audio", "video", "custom"];
  for (i in bookTypes) {
    let bookType = bookTypes[i];
    $.getJSON("/books/books/" + bookType, (books) => {
      const numBooks = books.length;
      for (var i = 0; i < numBooks; i++) {
        let book = books[i];
        createBookObject(book, bookType);
      }
    });
  }
}

createBookObject = (book, bookType) => {
  $.get("/components/book.html", (bookSkeleton) => {
    let skeleton = $(bookSkeleton);
    $("#" + bookType + "-books").append(skeleton);
    fillData(skeleton, book, bookType);
  });
}

fillData = (bookSkeleton, book, bookType) => {
  let bookTitle = $(bookSkeleton).find(".book-title")[0];
  $(bookTitle).text(book.fileName);
  let bookInfo = $(bookSkeleton).find(".book-info")[0];
  $(bookInfo).text("" + book.fileSize/1024 + " KB");
  let bookImage = $(bookSkeleton).find("img")[0];
  $(bookImage).attr("src", "book-" + bookType + ".png");
  $(bookSkeleton).data("fileName", book.fileName);
  $(bookSkeleton).data("bookType", bookType);
}

//open a book by accessing attributes and opening the window
openBook = (e) => {
  let book = $($(e.target).parent());
  let fileName = book.data("fileName");
  let bookType = book.data("bookType");
  window.open("/books/getBook/" + bookType + "/" + fileName);
}
