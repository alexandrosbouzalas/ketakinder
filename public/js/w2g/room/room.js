
const roomId = window.location.pathname.substring(window.location.pathname.length - 6, window.location.pathname.length)
const socket = io();

// This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');
          
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// This function creates an <iframe> (and YouTube player)
var player;



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
        var durationInSeconds = Math.floor(player.getDuration())
    
        $('#time-slider').attr('max', durationInSeconds)
    
        $('#end-time')[0].innerText = calculateTimeFormat(durationInSeconds);
        
    }, 1000)

}

function updateSliderAndTime() {

    var curTimeInSeconds = Math.floor(player.getCurrentTime());
    $('#time-slider')[0].value = curTimeInSeconds;
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
        videoId: 'M7lc1UVf-VE',
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

function showVideoControls() {

    setTimeout(() => {
        $("#player").css("display", "block");  
        $(".controls-container").css("display", "flex");  
        $("#info-content").css("display", "none");
        $("#button-container").css("display", "flex");
        $(".container-main").css("display", "block");
        $("#video-input").css("border", "none");
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

    if (reInputString.test(input) ) {
        return true;
    } else {
        return false;
    }
}

function loadNewVideo(videoId, unMute) {

    player.loadVideoById({videoId: videoId,
        startSeconds: 0,
    });
    
    if(unMute) {
        player.unMute()
        $('#mute-unmute-btn').children().removeClass('fa-volume-xmark');
        $('#mute-unmute-btn').children().addClass('fa-volume-high')
    }

    showVideoControls();

    initSliderAndTime();

    setInterval(function () {
        updateSliderAndTime()
    }, 1000);

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

    if(inputString) {
    
        if(validateInputString(inputString)) {

            // Grab the youtube url
            inputString = inputString.substring(inputString.length - 11, inputString.length);

            loadNewVideo(inputString, true);
            updateVideoUrl(inputString, roomId);


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

// receive a message from the server
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