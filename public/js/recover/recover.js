$("#first").attr("href", "/home");
$("#second").attr("href", "/register");
$("#first").first().text("Home");
$("#second").first().text("Register");

$("#email").addClass("inputBorder inputBorderFocus");

$("#submitbutton").on("click", function () {
  let valid = true;
  $("[required]").each(function () {
    if ($(this).is(":invalid") || !$(this).val()) {
      valid = false;
      $(this).removeClass("inputBorder");
      $(this).addClass("errorBorder");
      $("#message")
        .html("Please fill out all the fields")
        .addClass("errorText");
    } else {
      $(this).removeClass("errorBorder");
    }
  });
  if (valid) checkInput();
});

function checkInput() {
  var valid = true;

  $("[required]").each(function () {
    if (
      $(this).attr("id") === "email" &&
      (!$(this).val() || !checkPattern($(this).attr("id")))
    ) {
      $("#message").addClass("errorText");

      valid = false;
      $("#message").html("Format: text@text.domain");
      $(this).removeClass("inputBorder");
      $(this).addClass("errorBorder");
    }
  });
  if (valid) verifySuccess();
}

function checkPattern(id) {
  var element = document.getElementById(id).value;

  const reEmail =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  if (id === "email") return reEmail.test(element);
  return false;
}

const verifySuccess = () => {
  data = {};

  const formData = new FormData(document.querySelector("form"));
  for (var pair of formData.entries()) {
    if (pair[0] === "email") Object.assign(data, { email: pair[1] });
  }

  $.ajax({
    url: "/recover",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify({ data: data }),
    success: function (response) {
      Swal.fire({
        title: `Account recovery email sent to ${response.email}`,
        text: `If you don't see this email in your inbox within 15 minutes, look for it in your junk mail folder. If you findOne it there, please mark the email as “Not Junk”.`,
        icon: "success",
        allowOutsideClick: false,
        confirmButtonText: "OK",
        background: "#f1f4f6",
        confirmButtonColor: "#007bff",
      }).then(() => {
        window.location = "/";
      });
    },
    error: function (err) {
      Swal.fire({
        title: err.responseJSON.msg,
        icon: "error",
        allowOutsideClick: false,
        confirmButtonText: "OK",
        background: "#f1f4f6",
        confirmButtonColor: "#007bff",
      });
    },
  });
};
