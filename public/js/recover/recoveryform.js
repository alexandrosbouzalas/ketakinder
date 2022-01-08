$("#second").remove();
$("#first").attr("href", "/");
$("#first").first().text("Home");

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

  const rePassword =
    /^(?=(.*[a-z]){3,})(?=(.*[A-Z]){1,})(?=(.*[0-9]){2,})(?=(.*[!@#$%^&*()\-__+.]){1,}).{8,}$/;

  if (id === "password") return rePassword.test(element);
  return false;
}

const verifySuccess = () => {
  data = {};

  const formData = new FormData(document.querySelector("form"));
  for (var pair of formData.entries()) {
    if (pair[0] === "password") Object.assign(data, { password: pair[1] });
  }

  $.ajax({
    url: `/recover/${window.location.href.split("/")[4]}`,
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify({ data: data }),
    success: function (response) {
      Swal.fire({
        title: `Password changed successfully`,
        icon: "success",
        allowOutsideClick: false,
        showCloseButton: false,
        showCancelButton: false,
        showConfirmButton: false,
        width: "50%",
        background: "#f1f4f6",
        confirmButtonColor: "#007bff",
        timer: 3000,
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
        confirmButtonColor: "#007bff",
        background: "#f1f4f6",
        width: "50%",
      });
    },
  });
};
