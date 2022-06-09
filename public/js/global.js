function startTime() {
  var today = new Date();
  var h = today.getHours();
  var m = today.getMinutes();
  m = checkTime(m);
  document.getElementById("clock").innerHTML = h + ":" + m;
  var t = setTimeout(startTime, 500);
}
function checkTime(i) {
  if (i < 10) {
    i = "0" + i;
  } // add zero in front of numbers < 10
  return i;
}

window.onbeforeunload = function () {
  window.scrollTo(0, 0);
};

var burger = document.querySelector(".burger");
var burgerLinks = document.querySelector(".nav-links");
var burgerLines = document.querySelector(".burger");

burger.addEventListener("click", burgerNavigation);

function burgerNavigation() {
  burgerLinks.classList.toggle("burger-animation");
  burger.getElementsByTagName("div")[0].classList.toggle("line1-animate");
  burger.getElementsByTagName("div")[1].classList.toggle("line2-animate");
  burger.getElementsByTagName("div")[2].classList.toggle("line3-animate");
}

$("#logo").click(() => {
  window.location.pathname = "/";
})