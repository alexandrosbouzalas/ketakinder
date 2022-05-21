const socket = io();

function controlVideo(action) {
    $('.youtube-video')[0].contentWindow.postMessage('{"event":"command","func":"' + `${action}` + '","args":""}', '*');
}

function nextVideo() {
    $('.youtube-video')[0].contentWindow.postMessage('{"event":"command","func":"' + 'playVideoAt' + '","index":"10"}', '*');
}


var iframe = document.getElementById('video-player');


function updateVideo(inputString, roomId) {

    const data = {
        url: "https://www.youtube.com/embed/" + inputString + "?&modestbranding=1&controls=0&enablejsapi=1&version=3&playerapiid=ytplayer", 
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
    $("#info-content").css("display", "none");
    $("#button-container").css("display", "flex");
    $("#button-container").css("display", "flex");
    $('.container-main').css('display', 'block');
}

$('#platform-btn').click(() => {
    let inputString = $('#video-input').val();
    let linkTemplate = "https://www.youtube.com";

    if(inputString) {

        if(validateInputString(inputString)) {
            window.open(linkTemplate + "/watch?v=" + inputString.substring(inputString.length - 11, inputString.length), '_blank');      
        } else {
            $("#video-input").css("border", "3px solid red");
        }
    } else {
        window.open(linkTemplate, '_blank');
    }
})


$('#search-btn').click(() => {

    let inputString = $('#video-input').val().toString();
    let linkTemplate = "https://www.youtube.com/embed/" 

    const roomId = window.location.pathname.substring(window.location.pathname.length - 6, window.location.pathname.length)

    if(inputString) {

        if(validateInputString(inputString)) {

            // Grab the youtube url
            inputString = inputString.substring(inputString.length - 11, inputString.length);

            $('#video-player').attr('src', linkTemplate + inputString + "?&modestbranding=1&controls=0&enablejsapi=1&version=3&playerapiid=ytplayer");
            $("#video-input").css("border", "none");
            $("#video-player").css("display", "block");
            $("#info-content").css("display", "none");
            $("#button-container").css("display", "flex");
            $('.container-main').css('display', 'block')


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


$('#play-pause-btn').click(() => {
    if ($('#play-pause-btn').children().hasClass('fa-play')) {
        controlVideo('playVideo');
        $('#play-pause-btn').children().removeClass('fa-play');
        $('#play-pause-btn').children().addClass('fa-pause');
        socket.emit('playVideo')

    } else if ($('#play-pause-btn').children().hasClass('fa-pause')){
        controlVideo('pauseVideo');
        $('#play-pause-btn').children().removeClass('fa-pause');
        $('#play-pause-btn').children().addClass('fa-play');
        socket.emit('pauseVideo')
    }
});

$('#mute-unmute-btn').click(() => {
    if ($('#mute-unmute-btn').children().hasClass('fa-volume-xmark')) {
        controlVideo('unMute');
        $('#mute-unmute-btn').children().removeClass('fa-volume-xmark');
        $('#mute-unmute-btn').children().addClass('fa-volume-high');
        
    } else if ($('#mute-unmute-btn').children().hasClass('fa-volume-high')){
        controlVideo('mute');
        $('#mute-unmute-btn').children().removeClass('fa-volume-high');
        $('#mute-unmute-btn').children().addClass('fa-volume-xmark');
    }
});

iframe.addEventListener('load', function() { 
    socket.emit('statusCheck');
});

// receive a message from the server
socket.on("playVideo", (args) => {
    controlVideo('playVideo');
    $('#play-pause-btn').children().removeClass('fa-play');
    $('#play-pause-btn').children().addClass('fa-pause');
});

socket.on("pauseVideo", (args) => {
    controlVideo('pauseVideo');
    $('#play-pause-btn').children().removeClass('fa-pause');
    $('#play-pause-btn').children().addClass('fa-play');
});

socket.on('videoStatus', (args) => {  
    if(args === 'playing') {
        controlVideo('playVideo'); 
        $('#play-pause-btn').children().removeClass('fa-play');
        $('#play-pause-btn').children().addClass('fa-pause');
    }
    else if(args === 'paused'){
        controlVideo('playVideo'); 
        controlVideo('pauseVideo');
        $('#play-pause-btn').children().removeClass('fa-pause');
        $('#play-pause-btn').children().addClass('fa-play');
    }
})

