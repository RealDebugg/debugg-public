document.onreadystatechange = () => {
    if (document.readyState === "complete") {
        window.addEventListener('message', function(event) {
            if (event.data.type == "show") {
                $(".msgUI").removeClass("warning");
                $(".msgUI").removeClass("success");
                $(".msgUI").removeClass("inform");
                $(".msgUI").addClass(event.data.msgType);
                $(".msgUI").addClass("shown");
                $(".msgUI").html(event.data.msg);
            } else if (event.data.type == "hide") {
                $(".msgUI").removeClass("shown");
            };
        });
    };
};