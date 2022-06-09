

$("#username").addClass("inputBorder inputBorderFocus");
$("#email").addClass("inputBorder inputBorderFocus");
$("#password").addClass("inputBorder inputBorderFocus");
$("#passwordRepeat").addClass("inputBorder inputBorderFocus");

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
    }
  });
  if (valid) checkInput();
});

function checkInput() {
  var valid = true;

  $("[required]").each(function () {
    if (
      $(this).attr("id") === "username" &&
      (!$(this).val() || !checkPattern($(this).attr("id")))
    ) {
      valid = false;
      $("#message")
        .html("Usernames must be 5-20 characters long")
        .addClass("errorText");
      $(this).removeClass("inputBorder");
      $(this).addClass("errorBorder");
    }
    if (
      $(this).attr("id") === "email" &&
      (!$(this).val() || !checkPattern($(this).attr("id")))
    ) {
      valid = false;
      $("#message").html("Format: text@text.domain").addClass("errorText");
      $(this).removeClass("inputBorder");
      $(this).addClass("errorBorder");
    }
    if (
      $(this).attr("id") === "password" &&
      (!$(this).val() || !checkPattern($(this).attr("id")))
    ) {
      valid = false;
      var message;

      if ($(this).val().length < 8)
        message = "Please use a minimum of 8 characters for a valid password";
      else if (!checkPattern($(this).attr("id")))
        message = "Please use Upper, Lower, Numeric and Special characters";

      $("#message").html(message).addClass("errorText");
      $("#password").removeClass("inputBorder");
      $("#password").addClass("errorBorder");
      $("#passwordRepeat").removeClass("inputBorder");
      $("#passwordRepeat").addClass("errorBorder");
    }
    if ($("#password").val() !== $("#passwordRepeat").val()) {
      valid = false;
      $("#message").html("Passwords do not match").addClass("errorText");
      $("#password").removeClass("inputBorder");
      $("#password").addClass("errorBorder");
      $("#passwordRepeat").removeClass("inputBorder");
      $("#passwordRepeat").addClass("errorBorder");
    }
  });
  if (valid) verifySuccess();
}

function checkPattern(id) {
  var element = document.getElementById(id).value;

  const reUsername =
    /^[a-zA-Z0-9](_(?!(\.|_))|\.(?!(_|\.))|[a-zA-Z0-9]){2,18}[a-zA-Z0-9]$/;
  const reEmail =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  const rePassword =
    /^(?=(.*[a-z]){3,})(?=(.*[A-Z]){1,})(?=(.*[0-9]){2,})(?=(.*[!@#$%^&*()\-__+.]){1,}).{8,}$/;

  if (id === "username") return reUsername.test(element.toString().trim());
  if (id === "email") return reEmail.test(element.toString().trim());
  if (id === "password") return rePassword.test(element.toString().trim());
  return false;
}

const verifySuccess = () => {
  data = {};

  const formData = new FormData(document.querySelector("form"));
  for (var pair of formData.entries()) {
    if (pair[0] === "username")
      Object.assign(data, { username: pair[1].toString().trim() });
    if (pair[0] === "email")
      Object.assign(data, { email: pair[1].toString().trim() });
    if (pair[0] === "password")
      Object.assign(data, { password: pair[1].toString().trim() });
  }

  $.ajax({
    url: "/register",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify({ data: data }),
    success: function (response) {
      Swal.fire({
        title: `Registration email sent to ${response.email}.`,
        text: `If you don't see this email in your inbox within 15 minutes, look for it in your junk mail folder. If you findOne it there, please mark the email as “Not Junk”.`,
        icon: "success",
        allowOutsideClick: false,
        showCloseButton: false,
        showCancelButton: false,
        showConfirmButton: true,
        width: "50%",
        background: "#f1f4f6",
        confirmButtonColor: "#007bff",
      }).then(() => {
        window.location = "/home";
      });
    },
    error: function (err) {
      Swal.fire({
        title: err.responseJSON.msg,
        icon: "error",
        allowOutsideClick: false,
        confirmButtonText: "OK",
        confirmButtonColor: "#007bff",
        background: "#f1f4f6",
        width: "50%",
      });
    },
  });
};
