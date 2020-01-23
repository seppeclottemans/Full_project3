
function get_route_by_route_number(route_number){
    $.ajax({
        url: `http://localhost:3000/get_route_mongo_by_route_number/${route_number}`,
        method: 'GET'
    }).done(function (data) {
        if(data != null){
            localStorage.setItem('selectedRoute', data._id);
            window.location.replace("http://127.0.0.1:5500/routeinstructions.html");
        }else{
            $("#errorParagraph").remove();
            const errorParagraph = $('<p/>').text("Invalid number").attr('id', 'errorParagraph');
            $(".entercode").append(errorParagraph);
        }
    }).fail(function (err1, err2) {
        console.log('Fail');
        console.log(err1);
        console.log(err2);
    });
}

$("#selectCode").on("click", function(){
    let routeNumber = parseInt($("#code").val());
    if(Number.isInteger(routeNumber)){
        get_route_by_route_number(routeNumber);
    }
});

