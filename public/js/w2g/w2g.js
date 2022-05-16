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


