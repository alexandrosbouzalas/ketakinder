function validateInputString(input) {


    const reInputString = /^(https:\/\/([w]{3}\.)?youtu(be)?\.(com|de|be)\/(watch\?v=)?)?[a-zA-Z0-9_-]{11}$/;

    if (reInputString.test(input) ) {
        return true;
    } else {
        return false;
    }
}


if($('#video-player')[0].src.trim() != window.location.href) {
    $("#video-player").css("display", "block");
    $("#video-player-text").css("display", "none");
}

$('#platform-btn').click(() => {
    let inputString = $('#video-input').val();
    let linkTemplate = "https://www.youtube.com";

    if(inputString) {
        if(validateInputString(inputString)) {
            window.open(linkTemplate + "/watch?v=" + inputString, '_blank');      
        } else {
            $("#video-input").css("border", "3px solid red");
        }
    } else {
        window.open(linkTemplate, '_blank');
    }
})

function updateVideo(inputString, roomId) {

    const data = {
        url: "https://www.youtube.com/embed/" + inputString, 
        roomId: roomId
    }

    $.ajax({
        url: window.location.pathname,
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({ data: data }),
        error: function (err) {
          Swal.fire({
            title: "Can't update video. Server unreachable",
            icon: "error",
            allowOutsideClick: false,
            confirmButtonText: "OK",
            confirmButtonColor: "#007bff",
            background: "#f1f4f6",
            width: "50%",
          });
        },
    });

}

$('#search-btn').click(() => {

    let inputString = $('#video-input').val().toString();
    let linkTemplate = "https://www.youtube.com/embed/" 

    const roomId = window.location.pathname.substring(window.location.pathname.length - 6, window.location.pathname.length)

    if(inputString) {

        if(validateInputString(inputString)) {

            // Grab the youtube url
            inputString = inputString.substring(inputString.length - 11, inputString.length);

            $('#video-player').attr('src', linkTemplate + inputString);
            $("#video-input").css("border", "none");
            $("#video-player-text").css("display", "none");
            $("#video-player").css("display", "block");

            updateVideo(inputString, roomId)

        } else {
            $("#video-input").css("border", "3px solid red");
        }
            
    }
  
})

$(document).keydown(function(event) {
    if(event.key === "Enter" && $("#video-input").is(":focus")) {
        $('#search-btn').trigger('click');
    }
})
