$("#second").first().text("Logout");
$("#second").attr("href", "/logout");

$("#settings").click(function (event) {
  Swal.fire({
    title: "Coming soon...",
    showConfirmButton: false,
    background: "#f1f4f6",
    showClass: {
      popup: "animate__animated animate__fadeInUp",
    },
    hideClass: {
      popup: "animate__animated animate__fadeOutDown",
    },
  });
  event.preventDefault();
});

$("#support").click(function (event) {
  Swal.fire({
    title: "What is the problem?",
    input: "text",
    icon: "question",
    inputAttributes: {
      autocapitalize: "off",
    },
    showCancelButton: true,
    confirmButtonText: "Send",
    input: "textarea",
    inputPlaceholder: "Type your message here...",
    showCancelButton: true,
    reverseButtons: true,
    background: "#f1f4f6",
    confirmButtonColor: "#007bff",
    showClass: {
      popup: "animate__animated animate__fadeInUp",
    },
    hideClass: {
      popup: "animate__animated animate__fadeOutDown",
    },
  }).then((result) => {
    if (result.isConfirmed) {
      if (result.value.toString().trim() != "") {
        $.ajax({
          url: "/support",
          method: "POST",
          contentType: "application/json",
          data: JSON.stringify({ data: result.value.toString() }),
          success: function (response) {
            Swal.fire({
              title: "Thank you!",
              text: "We will reach out to you as soon as possible.",
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
    }
  });
  event.preventDefault();
});

$("#version").click(function (event) {
  Swal.fire({
    title: 'Version:  <strong style ="color: #3fc3ee">1.0</strong>',
    icon: "info",
    background: "#f1f4f6",
    showClass: {
      popup: "animate__animated animate__fadeInUp",
    },
    hideClass: {
      popup: "animate__animated animate__fadeOutDown",
    },
    showConfirmButton: false,
  });
  event.preventDefault();
});

$.ajax({
  url: "/home",
  method: "POST",
  contentType: "application/json",
  success: function (response) {
    try {
      if (response) {
        const channels = response.channels;
        const clients = response.clients;

        if (channels.length !== 0) {
          channels.forEach((channel) => {
            var channelType = "secondary";

            if (channel.channelCodecQuality === 0) channelType = "primary";

            var channelElement = `<li class="${channelType}" id="${channel.cid}">${channel.channelName}</li>`;

            if (!channel.channelName.includes("[spacer")) {
              $(".tsinfo").append(channelElement);
            }
          });
        }

        if (clients.length !== 0) {
          clients.forEach((client) => {
            if (client.clientDatabaseId == "46") client.clientCountry = "gr";

            let statusIcon = '<i class="fas fa-volume-up"></i>';

            if (client.clientInputMuted)
              statusIcon = '<i class="fas fa-microphone-slash"></i>';
            if (client.clientOutputMuted)
              statusIcon = '<i class="fas fa-volume-mute"></i>';

            if (!client.clientCountry) client.clientCountry = "de";

            var clientElement = `<li class="client">${statusIcon}${
              client.clientNickname
            }     <i class="flag-icon flag-icon-${client.clientCountry.toLowerCase()}"></i><li>`;

            var clientChannel = client.clientChannelGroupInheritedChannelId;

            $(`#${clientChannel}`).append(clientElement);
          });
        }
      } else {
        console.log("No data received");
      }
    } catch (e) {
      Swal.fire({
        title: "There was an error processing your request",
        icon: "error",
        allowOutsideClick: false,
        confirmButtonText: "OK",
        background: "#f1f4f6",
        confirmButtonColor: "#007bff",
      }).then(() => {
        $(".footer-basic").remove();
      });
    }
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
