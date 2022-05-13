document.getElementById("first").href = "/";
document.getElementById("first").innerText = "Home";
document.getElementById("second").href = "/logout";
document.getElementById("second").innerText = "Logout";


function validateInputString(input) {
    const reInputStringShort = /^https:\/\/youtube\.com\/watch\?v=[a-zA-Z0-9_]+$/;
    const reInputStringFull = /^https:\/\/www\.youtube\.com\/watch\?v=[a-zA-Z0-9_]+$/;

    if (!reInputStringShort.test(input) && !reInputStringFull.test(input) ) {
        return false;
    } else {
        return true;
    }
}

$('#platform-btn').click(() => {
    let inputString = $('#video-input').val();
    let linkTemplate = "https://www.youtube.com";

    if(inputString) {
        if(validateInputString(inputString)) {
            window.location.href = inputString;       
        } else {
            $("#video-input").css("border", "3px solid red");
        }
    } else {
        window.location.href = linkTemplate;
    }
})

$('#search-btn').click(() => {

    let inputString = $('#video-input').val();
    let linkTemplate = "https://www.youtube.com/embed/" 

    if(inputString) {

        if(validateInputString(inputString)) {

            inputString = inputString.split('=');
            $('#video-player').attr('src', linkTemplate + inputString[inputString.length - 1]);
            $("#video-input").css("border", "none");
            $("#video-player-text").css("display", "none");
            $("#video-player").css("display", "block");
            
        } else {
            $("#video-input").css("border", "3px solid red");
        }
            
    }
    
})