get_route_by_route_number(5);
function get_route_by_route_number(route_number){
    $.ajax({
        url: `http://localhost:3000/get_route_mongo_by_route_number/${route_number}`,
        method: 'GET'
    }).done(function (data) {
        console.log(data);
    }).fail(function (err1, err2) {
        console.log('Fail');
        console.log(err1);
        console.log(err2);
    });
}

