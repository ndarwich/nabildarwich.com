//load the correct page from the url
const widgetNames = ["overview", "laundryBuddy", "mapBuddy", "studyBuddy",
  "eventBuddy", "profileBuddy"];
const widgetItems = ["db", "lb", "mb", "sb", "eb", "pb"];
let dbPath = window.location.pathname;
let widgetName = dbPath.substr(dbPath.lastIndexOf("dormBuddy/") + 10);
if (! dbPath.includes("/dormBuddy/")) {
  widgetName = "";
}
console.info(widgetName);
//get time and display it as an am/pm locale string in the phone screen
let loadTime = () => {
  $("#currentTime").text(new Date()
    .toLocaleString("en-US",
    { hour: "numeric", minute: "numeric",
    hour12: true }));
}
let loadWidget = (widgetName) => {
  let widgetIdx = widgetNames.indexOf(widgetName);
  $("#db-screen").load("/components/db-" + widgetItems[widgetIdx] + ".html");
}

loadTime(); //load the time
if (widgetName === "") {
  $("#db-screen").load("/components/db-main.html");
} else {
  loadWidget(widgetName); //load the correct widget
}

//update time on clicks
$("body").on("click", () => {
  loadTime();
});
