
$("#email").addClass("inputBorder inputBorderFocus");
$("#password").addClass("inputBorder inputBorderFocus");

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
      $("#message").html("Invalid format");
      $(this).removeClass("inputBorder");
      $(this).addClass("errorBorder");
    }
    if (
      $(this).attr("id") === "password" &&
      (!$(this).val() || $(this).val().length < 8)
    ) {
      $("#message").addClass("errorText");

      valid = false;
      var message = "Valid passwords can not be smaller than 8 characters";

      $("#message").html(message);
      $("#password").removeClass("inputBorder");
      $("#password").addClass("errorBorder");
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

  if(reEmail.test(element)) {
    return reEmail.test(element);
  } else {
    if (id === "email") return reUsername.test(element);
  }
  if (id === "password") return rePassword.test(element);
  
  return false;
}

const verifySuccess = () => {
  data = {};
  const reEmail =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  const formData = new FormData(document.querySelector("form"));
  for (var pair of formData.entries()) {
    if(reEmail.test(pair[1])) {
      if (pair[0] === "email") Object.assign(data, { email: pair[1] });
    } else {
      if (pair[0] === "email") Object.assign(data, { username: pair[1] });
    }
    if (pair[0] === "password") Object.assign(data, { password: pair[1] });
  }

  $.ajax({
    url: "/login",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify({ data: data }),
    success: function (response) {
      if (response.msg && response.msg.includes("activated")) {
        Swal.fire({
          title: "Your account has not yet been activated",
          text: "Check you emails for the validation procedure.",
          icon: "warning",
          allowOutsideClick: false,
          showCancelButton: true,
          confirmButtonText: "Resend activation email",
          cancelButtonText: "OK",
          confirmButtonColor: "#007bff",
          background: "#f1f4f6",
        }).then((result) => {
          if (result.isConfirmed) {
            $.ajax({
              url: "/register/resend",
              method: "POST",
              contentType: "application/json",
              data: JSON.stringify({ data: data }),
              success: function (response) {
                Swal.fire({
                  title: `Registration email sent to ${response.email}.`,
                  text: `If you don't see this email in your inbox within 15 minutes, look for it in your junk mail folder. If you find it there, please mark the email as “Not Junk”.`,
                  icon: "success",
                  allowOutsideClick: false,
                  confirmButtonText: "OK",
                  background: "#f1f4f6",
                  confirmButtonColor: "#007bff",
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
          }
        });
      } else {
        Swal.fire({
          title: `Welcome back ${response.user.username}`,
          icon: "success",
          allowOutsideClick: false,
          showCloseButton: false,
          showCancelButton: false,
          showConfirmButton: false,
          background: "#f1f4f6",
          timer: 3000,
        }).then(() => {
          window.location = "/home";
        });
      }
    },
    error: function (err) {
      try {
        Swal.fire({
          title: err.responseJSON.msg,
          icon: "error",
          allowOutsideClick: false,
          confirmButtonText: "OK",
          background: "#f1f4f6",
          confirmButtonColor: "#007bff",
        });
      } catch {
        Swal.fire({
          title: "There was an error processing your request",
          icon: "error",
          allowOutsideClick: false,
          confirmButtonText: "OK",
          background: "#f1f4f6",
          confirmButtonColor: "#007bff",
        });
      }
    },
  });
};

$(document).keydown(function(event) {
  if(event.key === "Enter" && ($("#email").is(":focus") || $("#password").is(":focus"))) {
      $('#submitbutton').trigger('click');
  }
})