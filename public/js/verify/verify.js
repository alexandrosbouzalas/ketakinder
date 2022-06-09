$("#first").remove();
$("#second").remove();

window.onload = function () {
  setTimeout(() => {
    window.location.pathname = "/";
  }, 4000);
};
