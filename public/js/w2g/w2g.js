function validateInputString(input) {

  const reInputString = /^((https:\/\/)?(ketakinder\.tk\/w2g\/room\/))?[a-zA-Z0-9]{6}$/;

  if (reInputString.test(input) ) {
      return true;
  } else {
      return false;
  }

}


$('#room-creation-btn').on('click', () => {

    $.ajax({
        url: "/w2g",
        method: "POST",
        contentType: "application/json",
        success: function (response) {

            window.location.pathname = `/w2g/room/${response}`
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
})

$('#search-btn').click(() => {

  let inputString = $('#room-search-input').val().toString();

  if(inputString) {

      if(validateInputString(inputString)) {

          // Grab the youtube url
          inputString = inputString.substring(inputString.length - 6, inputString.length);

          window.location.pathname = `/w2g/room/${inputString}`;

      } else {
          $("#room-search-input").css("border", "3px solid red");
      }
          
  }

})

$(document).keydown(function(event) {
  if(event.key === "Enter" && $("#room-search-input").is(":focus")) {
      $('#search-btn').trigger('click');
  }
})
