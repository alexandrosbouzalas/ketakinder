function validateInputString(input) {


    const reInputString = /^(https:\/\/([w]{3}\.)?youtu(be)?\.(com|de|be)\/(watch\?v=)?)?[a-zA-Z0-9_-]{11}$/;

    if (reInputString.test(input) ) {
        return true;
    } else {
        return false;
    }
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

$('#search-btn').click(() => {

    let inputString = $('#video-input').val();
    let linkTemplate = "https://www.youtube.com/embed/" 

    if(inputString) {

        if(validateInputString(inputString)) {

            // Grab the youtube url
            inputString = inputString.substring(inputString.length - 11, inputString.length);

            $('#video-player').attr('src', linkTemplate + inputString);
            $("#video-input").css("border", "none");
            $("#video-player-text").css("display", "none");
            $("#video-player").css("display", "block");
 /*            $("#container").css("background-color", "#546080"); 
            $("#container").css("margin-top", "200px"); 
            $("#container").css("margin-bottom", "100px");  */
            
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