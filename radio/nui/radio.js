// Log with line numbers
var log = console.log.bind(window.console);
let paywall = false;

// Date prototype helpers
Date.prototype.stdTimezoneOffset = function () {
    var jan = new Date(this.getFullYear(), 0, 1);
    var jul = new Date(this.getFullYear(), 6, 1);
    return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
};

Date.prototype.isDstObserved = function () {
    return this.getTimezoneOffset() < this.stdTimezoneOffset();
};

function addZero(i) {
    return i < 10 ? "0" + i : i;
}

var backlightTimeout;
function playButtonPress(buttonEnabled) {
    var audio;
    clearTimeout(backlightTimeout);
    if (buttonEnabled) {
        audio = new Audio("sounds/buttonpress.mp3");
    } else {
        audio = new Audio("sounds/buttondeny.mp3");
    }
    $("#radioDisplay").addClass("backlight");
    backlightTimeout = setTimeout(() => {
        $("#radioDisplay").removeClass("backlight");
    }, 5000);
    audio.volume = 0.05;
    audio.play();
}

function bootPress(buttonEnabled) {
    var audio;
    clearTimeout(backlightTimeout);
    if (buttonEnabled) {
        audio = new Audio("sounds/general/MotorolaOn.wav");
    } else {
        audio = new Audio("sounds/general/MotorolaOff.wav");
    }
    audio.volume = 0.3;
    audio.play();
}

var websocket;
// If the plugin socket is connected
var wsConnected = false;
// If we notified them of the disconnect
var disconnectNotified = false;
// Current resource name. Set by NUI
var resourceName = "";
// Which talkgroup the primary channel is on
var talkGroup = 1;
// The position in the talkgroup list of the scanner
var scannedTalkGroup = 1;
// If user is trying to set the scanned channels
var scanning = false;

var radioEnabled = false;
// If channel scanning is active
var scanningOn = false;
// If the officer is having an emergency
var panicked = false;
// If the radio is connected to a radio tower and has access to the trunk
var radioConnected = true;

// Holds all the talkgroups sent by the plugin
var talkGroups = [];
// Holds the actively scanned talkgroups
var scannedTalkGroups = [];

//$("#errorText").text("Linking. . . .");
//$("#errorText").css("color", "darkblue");

function init() {
    wsConnected = true;
    disconnectNotified = false;
    $("#radio").removeClass("nolink");
    $("#connectionBox").hide();
    paywall = false;

    $("#errorText").text("Linked");
    $("#errorText").css("color", "white");
}

function sendNUI(name, payload) {
    $.post("http://" + resourceName + "/" + name, payload, function (datab) {
        if (datab != "ok") {
            log("NUI ERROR: " + datab);
        }
    });
}

function checkRadioState() {
    $("#nolink").hide();
    if (radioEnabled) {
        scanning = false;
        $("#topText").text("Channel");
        $("#topText").css("color", "black");
        $("#topText").show();

        $("#chText").text();
        $("#chText").css("color", "black");

        $("#btm1Text").text("S/L");
        $("#btm2Text").text("");
        $("#btm3Text").text("Ch 1");
        $("#btmText").show();

        $("#radioDisplay").fadeIn();
    } else {
        $("#radioDisplay").fadeOut();
    }
}

function sendNotification(text) {
    sendNUI(
        "showNotification",
        JSON.stringify({
            notification: text,
        })
    );
}

$(function () {
    // Close if they click anywhere but inside the radio box
    $(document).click((e) => {
        if ($(e.target).closest("#radio").length < 1) {
            sendNUI("hide", "");
            $("#radio").fadeOut();
        }
    });

    // Close if they press the tilda key again, or attempt to walk with the keyboard
    $("body").keypress(function (event) {
        // Tilde, W, A, S, D
        if (
            event.charCode == 96 ||
            event.charCode == 119 ||
            event.charCode == 97 ||
            event.charCode == 100 ||
            event.charCode == 115
        ) {
            if ($("#radio").is(":visible")) {
                sendNUI("hide", "");
                $("#radio").fadeOut();
            }
        }
    });

    $("#panicBtn").click(() => {
        if (!radioEnabled) return;
        if (panicked) return;

        playButtonPress(true);
        sendNUI("panic", "");
    });

    // Toggle the radio
    $("#pwrBtn").click(() => {
        if (panicked) return;

        scanning = false;
        radioEnabled = !radioEnabled;
        sendNotification(
            "Radio " + (radioEnabled ? "~g~enabled" : "~r~disabled")
        );
        bootPress(radioEnabled)
        sendNUI("radioState", JSON.stringify({ state: radioEnabled }));
        if (radioEnabled) {
            $("#radioDisplay").addClass("backlight");
            clearTimeout(backlightTimeout);
            backlightTimeout = setTimeout(() => {
                $("#radioDisplay").removeClass("backlight");
            }, 5000);
        }
        checkRadioState();
        sendNUI("checkState");
    });

    $("#chDownBtn").click(() => {
        if (!radioEnabled) return;
        if (panicked) return;

        playButtonPress(true);

        sendNUI("chUpd", JSON.stringify({ talkgroup: "down" }));
        sendNUI("checkState");
        checkRadioState();
    });

    $("#chUpBtn").click(() => {
        if (!radioEnabled) return;
        if (panicked) return;

        playButtonPress(true);

        sendNUI("chUpd", JSON.stringify({ talkgroup: "up" }));
        sendNUI("checkState");
        checkRadioState();
    });

    // Top row of buttons
    $("#softBtn1").click(() => {
        // Scan button
        if (!radioEnabled) return;
        if (panicked) return;

        scanning = !scanning;
        playButtonPress(true);

        if (scanning) {
            $("#topText").text("Scan Channels");
            if (scanningOn) {
                $("#topText").css("color", "green");
            }
            $("#chText").text(talkGroups[scannedTalkGroup]);
            let isScanned = scannedTalkGroups.indexOf(scannedTalkGroup);
            let set = "Set";
            if (isScanned > -1) {
                $("#chText").css("color", "green");
                set = "Unset";
            } else {
                $("#chText").css("color", "black");
            }

            $("#btm1Text").text("S/L");
            $("#btm2Text").text(set);
            $("#btm3Text").text(scanningOn ? "Off" : "On");
        } else {
            checkRadioState();
        }
    });

    $("#softBtn2").click(() => {
        // Select button
        if (!radioEnabled) return;
        if (panicked) return;

        if (scanning) {
            sendWS(
                JSON.stringify({
                    type: "scan_talkgroup",
                    talkgroup: scannedTalkGroup,
                })
            );
        } else {
            playButtonPress(false);
        }
    });

    $("#softBtn3").click(() => {
        // Misc Function button
        if (!radioEnabled) return;
        playButtonPress(true);

        if (!scanning) {
            if (talkGroup != 1) {
                talkGroup = 1;
                sendWS(
                    JSON.stringify({
                        type: "set_talkgroup",
                        talkgroup: talkGroup,
                    })
                );
            }
        } else {
            if (panicked) return;
            scanningOn = !scanningOn;
            sendWS(
                JSON.stringify({
                    type: "scan_state",
                    state: scanningOn,
                })
            );

            if (scanningOn) {
                $("#topText").css("color", "green");
                $("#topText").text("Scan enabled");
                $("#btm3Text").text("Off");
            } else {
                $("#topText").text("Scan disabled");
                $("#topText").css("color", "red");
                $("#btm3Text").text("On");
            }
            setTimeout(() => {
                if (scanning) {
                    $("#topText").text("Scan Channels");
                    $("#topText").css("color", scanningOn ? "green" : "black");
                } else {
                    $("#topText").text("Channel");
                }
            }, 2000);
        }
    });

    // Bottom row of buttons
    $("#softBtn4").click(() => {
        if (!radioEnabled) return;
        if (panicked) return;

        playButtonPress(true);

        // Decrement talk group id
        if (!scanning) {
            sendNUI("chUpd", JSON.stringify({ talkgroup: "down" }));
            sendNUI("checkState");
            checkRadioState();
        } else {
            if (scannedTalkGroup < 2) {
                scannedTalkGroup = talkGroups.length - 1;
            } else {
                scannedTalkGroup--;
            }
            $("#chText").text(talkGroups[scannedTalkGroup]);
            let isScanned = scannedTalkGroups.indexOf(scannedTalkGroup);
            let set = "Set";
            if (isScanned > -1) {
                $("#chText").css("color", "green");
                set = "Unset";
            } else {
                $("#chText").css("color", "black");
            }
            $("#btm1Text").text("S/L");
            $("#btm2Text").text(set);
            $("#btm3Text").text(scanningOn ? "Off" : "On");
        }
    });

    $("#softBtn5").click(() => {
        // Menu button
        if (panicked) return;
        if (scanning) {
            playButtonPress(true);
            $("#softBtn1").click();
        } else {
            playButtonPress(false);
        }
    });

    $("#softBtn6").click(() => {
        // Increment talk group id
        if (!radioEnabled) return;
        if (panicked) return;

        playButtonPress(true);

        if (!scanning) {
            sendNUI("chUpd", JSON.stringify({ talkgroup: "up" }));
            sendNUI("checkState");
            checkRadioState();
        } else {
            if (talkGroups.length - 1 == scannedTalkGroup) {
                scannedTalkGroup = 1;
            } else {
                scannedTalkGroup++;
            }
            $("#chText").text(talkGroups[scannedTalkGroup]);
            let isScanned = scannedTalkGroups.indexOf(scannedTalkGroup);
            let set = "Set";
            if (isScanned > -1) {
                $("#chText").css("color", "green");
                set = "Unset";
            } else {
                $("#chText").css("color", "black");
            }
            $("#btm1Text").text("S/L");
            $("#btm2Text").text(set);
            $("#btm3Text").text(scanningOn ? "Off" : "On");
        }
    });

    // NUI listener
    window.addEventListener("message", function (event) {
        handleNUI(event.data);
    });
});

function handleNUI(data) {
    if (data.type == "resource_name") {
        resourceName = data.name;
    } else if (data.type == "show_radio") {
        $("#radio").fadeIn();
        let today = new Date();
        if (
            (today.getMonth() == 3 && today.getDate() == 1) ||
            (today.getMonth() == 2 && today.getDate() == 16)
        ) {
            $("#img").attr("src", "radio1_final.png");
        }
    } else if (data.type == "hide_radio") {
        $("#radio").fadeOut();
    } else if (data.type == "heartbeat") {
        $("#radio").removeClass("nolink");
    } else if (data.type == "location_update") {
        let date = new Date();
        $("#time").text(
            addZero(date.getUTCHours()) +
                ":" +
                addZero(date.getUTCMinutes()) +
                "z"
        );
        let restart = new Date();
        restart.setUTCHours(12);
        if (date.isDstObserved()) {
            restart.setUTCHours(11);
        }
        restart.setUTCMinutes(0);
        restart.setUTCSeconds(0);
        restart.setUTCMilliseconds(0);

        if (
            (date.isDstObserved() && date.getUTCHours() > 11) ||
            date.getUTCHours() > 12
        ) {
            restart.setUTCDate(date.getUTCDate() + 1);
        }
        const hours = Math.floor(Math.abs(restart - date) / 1000 / 3600) % 24;
        $("#batteryBar1").show();
        $("#batteryBar2").show();
        $("#batteryBar3").show();

        if (hours < 8) {
            $("#batteryBar2").hide();
            $("#batteryBar3").hide();
        } else if (hours < 16) {
            $("#batteryBar3").hide();
        }
    } else if (data.type == "connection_status") {
        radioConnected = data.status;
        if (data.status) {
            $("#rangeText").hide();
            if (radioEnabled) {
                sendNotification("~g~Radio signal acquired");
            }
        } else {
            $("#rangeText").show();
            if (radioEnabled) {
                sendNotification("~r~Radio signal lost");
            }
        }
    } else if (data.type == "tower_size") {
        $("#towerBar1").hide();
        $("#towerBar3").hide();
        $("#towerBar2").hide();
        if (data.tower == 1 && radioEnabled) {
            $("#towerBar1").show();
        } else if (data.tower == 2 && radioEnabled) {
            $("#towerBar1").show();
            $("#towerBar2").show();
        } else if (data.tower == 3 && radioEnabled) {
            $("#towerBar1").show();
            $("#towerBar2").show();
            $("#towerBar3").show();
        }
    } else if (data.type == "radio_ping") {
        sendNotification(
            "~o~Your radio has been pinged! ~r~Please pay attention to your radio"
        );
        audio = new Audio("sounds/general/MotorolaPing.wav");
        audio.volume = 0.3;
        audio.play();
    } else if (data.type == "channel_display") {
        $("#chText").text(data.text);
    } else if (data.type == "ea_alert") {
        if (data.valid) {
            $("#rangeText").text("EA:" + data.text);
            $("#rangeText").show();
            audio = new Audio("sounds/tones/emergency_button.wav");
            audio.volume = 0.3;
            audio.play();
        } else {
            $("#rangeText").hide();
        }
    } else if (data.type == "nolink") {
        if (data.valid) {
            $("#nolink").show();
            $("#radio").addClass("nolink");
            $("#topText").hide();
            $("#chText").hide();
            $("#btmText").hide();
            if (!data.boot) {
                audio = new Audio("sounds/general/MotorolaTalkPermit2.wav");
                audio.volume = 0.3;
                audio.play();
            }
            panicked = true;
        } else {
            $("#nolink").hide();
            $("#radio").removeClass("nolink");
            $("#topText").show();
            $("#chText").show();
            $("#btmText").show();
            panicked = false;
        }
    } else if (data.sound && data.volume) {
        document.getElementById(data.sound)
        document.getElementById(data.sound).load();
        document.getElementById(data.sound).volume = data.volume;
        document.getElementById(data.sound).play();
    } else if (data.type == "signal_100") {
        audio = new Audio("sounds/tones/signal_100.mp3");
        audio.volume = 0.3;
        audio.play();
    } else {
        log("Unrecognized command: " + data.type);
    }
}

function handleWS(data) {
    if (data.type == "talkgroup_list") {
        talkGroups = Object.keys(data.talkgroups).map(
            (k) => data.talkgroups[k]
        );
        talkGroups.unshift("Not Set");
    } else if (data.type == "set_talkgroup") {
        talkGroup = data.talkgroup;
        if (!scanning) {
            $("#chText").text("" + talkGroups[talkGroup]);
        }
        $("#talkAround").toggle(data.is_talkaround);
        if (radioEnabled) {
            sendNotification("Talkgroup set to ~g~" + talkGroups[talkGroup]);
        }
    } else if (data.type == "scanned_channels") {
        scannedTalkGroups = Object.keys(data.talkgroups).map((k) =>
            parseInt(data.talkgroups[k])
        );
        if (scanning) {
            let isScanned = scannedTalkGroups.indexOf(scannedTalkGroup);
            if (isScanned > -1) {
                $("#chText").css("color", "green");
                $("#btm2Text").text("Unset");
            } else {
                $("#chText").css("color", "black");
                $("#btm2Text").text("Set");
            }
        }
    } else if (data.type == "scanning_enabled") {
        scanningOn = data.enabled;
        $("#scanning").toggle(scanningOn);
    } else if (data.type == "911_status") {
        sendNotification(data.message);
    } else if (data.type == "scan_result") {
        if (data.channel_scannable) {
            playButtonPress(true);
        } else {
            playButtonPress(false);
        }
    } else if (data.type == "error") {
        log("ERROR: " + data.message);
        sendNotification("~r~" + data.message);
    }
}
