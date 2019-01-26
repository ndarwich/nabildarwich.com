$(window).on("load", function() {
    loadNavigation(-1);
    let pageURL = window.location.href;
  $("#page-body").load("/pages/cs367.html", listenToInputs);
});

listenToInputs = () => {
  $(".gradeInput").on("input", (e) => {
    console.info(e);
    recalculateTotal();
  })
}

recalculateTotal = () => {
  castToInt("#e1")
  try {
    exams = castToInt("#e1")*15/100 + castToInt("#e2")*15/100 + castToInt("#e3")/4
    $("#examTotal").text("" + parseFloat(exams).toFixed(2))
    projects = castToInt("#p1")/10 + castToInt("#p2")/7 + castToInt("#p3")/10
    $("#projectTotal").text("" + parseFloat(projects).toFixed(2))
    quizzes =  castToInt("#q1")*0.015 + castToInt("#q2")*0.015 +
      castToInt("#q3")*0.015 + castToInt("#q4")*0.015 + castToInt("#q5")*0.015
    $("#quizTotal").text("" + parseFloat(quizzes).toFixed(2))
    recitations = (castToInt("#a1") + castToInt("#a2") + castToInt("#a3") +
      castToInt("#a4") + castToInt("#a5") + castToInt("#a6") + castToInt("#a7") +
      castToInt("#a8") + castToInt("#a9") + castToInt("#a10") + castToInt("#a11") +
      castToInt("#a12") + castToInt("#a13"))/13*7.5;
    $("#recitationTotal").text("" + parseFloat(recitations).toFixed(2))
    total =  recitations + projects + exams + quizzes;
    $("#finalGrade").text("" + parseFloat(total).toFixed(2))
  } catch (e) {
    console.info("couldn't calculate total due to exception");
  }
}

castToInt = (elementId) => {
  elementVal = $(elementId).val()
  if (elementVal === "") {
    return 0;
  } else {
    return Number.parseInt(elementVal);
  }
}
