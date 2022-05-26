
const roomId = window.location.pathname.substring(window.location.pathname.length - 6, window.location.pathname.length)

const roomName = window.location.href.substring(window.location.href.lastIndexOf('/') + 1);
const socket = io({
    query: {
        roomName: roomName,
    },
});

// This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// This function creates an <iframe> (and YouTube player)
var player;
let forwardingInterval;
var playerState = 1;

$('#copy-text')[0].placeholder = window.location.href;


function calculateTimeFormat(duration)
{   
    // Hours, minutes and seconds
    var hrs = ~~(duration / 3600);
    var mins = ~~((duration % 3600) / 60);
    var secs = ~~duration % 60;

    // Output like "1:01" or "4:03:59" or "123:03:59"
    var ret = "";

    if (hrs > 0) {
        ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
    }

    ret += "" + mins + ":" + (secs < 10 ? "0" : "");
    ret += "" + secs;
    return ret;
}

function initSliderAndTime() {

    setTimeout(() => {
        var durationInSeconds = player.getDuration()
    
        $('#time-slider').attr('max', player.getDuration().toString().match(/^-?\d+(?:\.\d{0,1})?/)[0])
    
        $('#end-time')[0].innerText = calculateTimeFormat(durationInSeconds);
        
    }, 2000);

}

function updateSliderAndTime() {

    var curTimeInSeconds = player.getCurrentTime();

    $('#time-slider')[0].value = curTimeInSeconds.toString().match(/^-?\d+(?:\.\d{0,1})?/)[0];
    $('#current-time')[0].innerText = calculateTimeFormat(curTimeInSeconds);

}

// The API will call this function when the video player is ready.
function onPlayerReady(event) {
    getVideoUrl();
}

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        playerVars: {
            autoplay: 1,
            controls: 0,
            modestbranding: 1,
            mute: 1,
            showinfo: 0,
        },
        videoId: 'dQw4w9WgXcQ',
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}


// The API calls this function when the player's state changes.
// The function indicates that when playing a video (state=1),
// the player should play for six seconds and then stop.
function onPlayerStateChange(event) {
   if(event.data == YT.PlayerState.PAUSED) {
    $('#play-pause-btn').children().removeClass('fa-pause');
    $('#play-pause-btn').children().addClass('fa-play');
    socket.emit('pauseVideo')
  } else if (event.data == YT.PlayerState.PLAYING) {
    $('#play-pause-btn').children().removeClass('fa-play');
    $('#play-pause-btn').children().addClass('fa-pause');
    socket.emit('playVideo')
  }

  playerState = event.data;

}

function getVideoUrl() {
    const data = {
        roomId: roomId,
        action: "fetch"
    }

    $.ajax({
        url: window.location.pathname,
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({ data: data }),
        success: function(response) {
            if(response) {
                loadNewVideo(response);
            } 
        },
        error: function (err) {
          Swal.fire({
            title: "Can't fetch video url. Server unreachable",
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

function copyToClipboard() {

    let copyText = $('#copy-text')[0].placeholder;
  
     // Copy the text inside the text field 
    navigator.clipboard.writeText(copyText)
    .then(() => {
        try{
            $('#copy-btn').css('background-color', '#fdfd96');
            $("#copy-btn>i").removeClass('fa-copy');
            $("#copy-btn>i").addClass('fa-check');
            setTimeout(() => {
              $('#copy-btn').css('background-color', 'rgb(211, 211, 211)');
              $("#copy-btn>i").removeClass('fa-check');
              $("#copy-btn>i").addClass('fa-copy');
            }, 3000)
        } catch {
            $('#copy-btn').css('background-color', '#ff6961');
            $("#copy-btn>i").removeClass('fa-copy');
            $("#copy-btn>i").addClass('fa-xmark');
            setTimeout(() => {
                $('#copy-btn').css('background-color', 'rgb(211, 211, 211)');
                $("#copy-btn>i").removeClass('fa-xmark');
                $("#copy-btn>i").addClass('fa-copy');
            }, 3000)
        }
    })
    .catch(() => {
        $('#copy-btn').css('background-color', '#ff6961');
        $("#copy-btn>i").removeClass('fa-copy');
        $("#copy-btn>i").addClass('fa-xmark');
        setTimeout(() => {
            $('#copy-btn').css('background-color', 'rgb(211, 211, 211)');
            $("#copy-btn>i").removeClass('fa-xmark');
            $("#copy-btn>i").addClass('fa-copy');
        }, 3000)
    });
}

function showVideoControls() {

    setTimeout(() => {
        $("#player").css("display", "block");  
        $(".controls-container").css("display", "flex");  
        $("#info-content").css("display", "none");
        $("#button-container").css("display", "flex");
        $(".container-main").css("display", "block");
        $("#video-input").css("color", "black");
    }, 500);
        
}

function hideVideoControls() {
    $("#player").css("display", "none");  
    $(".controls-container").css("display", "none");  
    $("#info-content").css("display", "block");
    $("#button-container").css("display", "none");
    $(".container-main").css("display", "flex");
}

function updateVideoUrl(inputString) {

    const data = {
        url: inputString, 
        roomId: roomId,
        action: "update"
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

    if (reInputString.test(input.trim()) ) {
        return true;
    } else {
        return false;
    }
}

function loadNewVideo(videoId, unMute, startSeconds) {

    player.loadVideoById({videoId: videoId,
        startSeconds: startSeconds | 0,
    });
    
    $('#video-input')[0].value = "https://www.youtube.com/watch?v=" + videoId;

    if(unMute) {
        player.unMute();
        $('#mute-unmute-btn').children().removeClass('fa-volume-xmark');
        $('#mute-unmute-btn').children().addClass('fa-volume-high');
    }

    showVideoControls();

    initSliderAndTime();

    forwardingInterval = setInterval(function () {
        updateSliderAndTime();
    }, 100);
}

$('#copy-btn').click(() => {
    copyToClipboard();
})

$('#platform-btn').click(() => {
    let inputString = $('#video-input').val();
    let linkTemplate = "https://www.youtube.com";

    if(inputString) {
        if(validateInputString(inputString)) {
            window.open(linkTemplate + "/watch?v=" + inputString.substring(inputString.length - 11, inputString.length), '_blank');      
        } else {
            $("#video-input").css("color", "red");
        }
    } else {
        window.open(linkTemplate, '_blank');
    }
})


$('#search-btn').click(() => {
    let inputString = $('#video-input').val().toString();

    if(inputString) {
    
        if(validateInputString(inputString)) {

            // Grab the youtube url
            inputString = inputString.substring(inputString.length - 11, inputString.length);

            loadNewVideo(inputString, true);

            updateVideoUrl(inputString, roomId);
            socket.emit('videoUrlChange', inputString);

        } else {
            $("#video-input").css("color", "red");
        }    
    }
})

$(document).keydown(function(event) {
    if(event.key === "Enter" && $("#video-input").is(":focus")) {
        $('#search-btn').trigger('click');
    }
})

$('#time-slider').on('input',() => {
    $('#current-time')[0].innerText = calculateTimeFormat($('#time-slider')[0].value);
    clearInterval(forwardingInterval);
})

$('#time-slider').change(() => {
    player.seekTo($('#time-slider')[0].value);
    $('#current-time')[0].innerText = calculateTimeFormat($('#time-slider')[0].value);

    if($('#time-slider')[0].value != $('#time-slider')[0].max) {
        forwardingInterval = setInterval(function () {
            updateSliderAndTime()
        }, 100);
    }
    socket.emit('videoTimeChange', $('#time-slider')[0].value)
})

$('#play-pause-btn').click(() => {
    if ($('#play-pause-btn').children().hasClass('fa-play')) {
        player.playVideo()
        $('#play-pause-btn').children().removeClass('fa-play');
        $('#play-pause-btn').children().addClass('fa-pause');
        socket.emit('playVideo')
        
    } else if ($('#play-pause-btn').children().hasClass('fa-pause')){
        player.pauseVideo()
        $('#play-pause-btn').children().removeClass('fa-pause');
        $('#play-pause-btn').children().addClass('fa-play');
        socket.emit('pauseVideo')
    }
});

$('#mute-unmute-btn').click(() => {
    if ($('#mute-unmute-btn').children().hasClass('fa-volume-xmark')) {
        player.unMute()
        $('#mute-unmute-btn').children().removeClass('fa-volume-xmark');
        $('#mute-unmute-btn').children().addClass('fa-volume-high');
        
    } else if ($('#mute-unmute-btn').children().hasClass('fa-volume-high')){
        player.mute()
        $('#mute-unmute-btn').children().removeClass('fa-volume-high');
        $('#mute-unmute-btn').children().addClass('fa-volume-xmark');
    }
});

socket.on("videoUrlChange", (args) => {
    loadNewVideo(args, true, 1);
});

socket.on("videoTimeChange", (args) => {
    player.seekTo(args);
});

socket.on("playVideo", (args) => {
    player.playVideo()
    $('#play-pause-btn').children().removeClass('fa-play');
    $('#play-pause-btn').children().addClass('fa-pause');
});

socket.on("pauseVideo", (args) => {
    player.pauseVideo()
    $('#play-pause-btn').children().removeClass('fa-pause');
    $('#play-pause-btn').children().addClass('fa-play');
});

socket.on("error", (args) => {
    Swal.fire({
        title: args.toString(),
        icon: "error",
        allowOutsideClick: false,
        confirmButtonText: "OK",
        confirmButtonColor: "#007bff",
        background: "#f1f4f6",
        width: "50%",
    }).then(() => {
        window.location.pathname = 'w2g';
    });
});