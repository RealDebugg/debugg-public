$(document).ready(function(){
  var SvType = 2;  //1 = RedM, 2 = FiveM
  var SvName = "RedM";
  var filled = false;
  var PlayerName = null;
  if (SvType === 1) {
    SvName = "RedM"
  } else if (SvType === 2) {
    SvName = "FiveM"
  }
  // Listen for NUI Events
  window.addEventListener('message', function(event){
    var item = event.data;
    // Open UI
    if(item.open == true) {
      $(".report-container").css("display", "block");
      PlayerName = item.playerName;
    }
  });
  // On 'Esc' call close method
  document.onkeyup = function (data) {
    if (data.which == 27 ) {
      $(".report-container").css("display", "none");
      $.post('http://debugg-bugs/close', JSON.stringify({}));
    }
  };
  $("#submit-button").click(function(){
    const submitPayload = {
      titleTxt: SvName + " Bug Report",
      descTxt: "**Title:**\n" + document.getElementById('title').value + "\n**Description:**\n" + document.getElementById('desc').value + "\n**VOD/Clip/Screenshot:**\n" + document.getElementById('vod').value,
      footer: "Reported in-game using the report bug menu by " + PlayerName
    }
    if (!filled) {
      if (document.getElementById('title').value.length > 1 && document.getElementById('desc').value.length > 1 && document.getElementById('vod').value.length > 1) {
        filled = true;
      }
    }

    if (filled) {
      document.getElementById("bug-form").reset();
      $.post('http://debugg-bugs/submit', JSON.stringify(submitPayload));
      filled = false;
    }
  });
});
