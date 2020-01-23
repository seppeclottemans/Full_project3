$(function () {
    let count = 0;
    let currentRoute;
    $('#loading_screen').remove();

    let appendRoutes = (allRoutes) => {
        for (let route of allRoutes) {
            if (route.name != 'custom_route') {
                $('.carousel').append(`<figure>
           <a href="routeinf.html"><img src="${route.images[0]}" alt="" class="${route._id}"></a>
       <figcaption>
            <h2>${route.name}</h2>
            <p>${route.info}</p>
            <button class="btn readmore ${route.id}"><a href="routeinf.html">Read more >></a></button>
        </figcaption>
    </figure>`);
            }
        }

        $('.carousel figure img').click(function () {
            let selectedRoute = $(this).attr('class');
            localStorage.setItem('selectedRoute', selectedRoute);
        });
        $('.carousel .readmore').click(function () {
            let selectedRoute = $($(this).parent()).attr('class')[2];
            localStorage.setItem('selectedRoute', selectedRoute);
        });
    }

    let displaySelectedRoute = (route) => {
        let nameTemp = route.name.split("_");
        let name = "";
        nameTemp.forEach(function(part){
            name += " " + part;
        });
        $('#route-inf').append(`
            <h1>${name}</h1>
                            <img src="${route.images[0]}" alt="">
                            <p>${route.info}</p>
                            <div>
                                <div class="route-inf-extra">
                                    <p>Rating:</p><div class="existingroute-rating starrr"></div>
                                </div>
                                <div class="route-inf-extra">
                                    <p>Duration:</p>
                                    <p class="redorange">2:45h</p>
                                </div>
                            </div>
                            <h3 id="routeCodeInf">Fill in this code in the app:</h2>
                            <p id="routeCode"></p>
                            <button class="btn"><a href="routeinstructions.html">Select route</a></button>
        `)
        route.images.forEach(function (routeImg) {
            $('#route-gallery').append(`<img src="${routeImg}">`)
        });
        $('.existingroute-rating').starrr({
            rating: Math.round(route.rating),
            readOnly: true
        })

        if(route.name == "custom_route"){
            $(".route-inf-extra").hide();
        }

        if(route.route_number != undefined){
            $("#routeCode").text(route.route_number);
        } else {
            $("#routeCodeInf").hide();
        }
    }

    function updateRating(routeId, rating) {
        $.post(`http://localhost:3000/update_rating/${routeId}`, { rating: rating }).fail(function (err1, err2) {
            console.log('Fail');
            console.log(err1);
            console.log(err2);
        });
        // $.ajax({
        //     url: `http://localhost:3000/update_rating/${routeId}`,
        //     method: 'POST',
        //     data: {
        //         rating: rating
        //     }
        // }).done(function (data) {

        // }).fail(function (err1, err2) {
        //     console.log('Fail');
        //     console.log(err1);
        //     console.log(err2);
        // });
    }

    let displayRouteInstructions = (route) => {
        console.log(route);
        console.log(count);

        //make the name of the generated routes nice to display
        let nameTemp = route.name.split("_");
        let name = "";
        nameTemp.forEach(function(part){
            name += " " + part;
        });

        //display the name
        $('#route-instructions').prepend(`<h1>${name}</h1>`);
        //display the image
        $("#route-instructions img").attr("src", route.images[count]);
        //get the information from the painting
        $.post(`http://localhost:3000/getOnePainting`, { id: route.paintingsIDs[count] }, function(data){
            $("#gotoinf h2").text(data.title);
            $("#gotoinf h3").text(data.artist);
            $("#gotoinf p").text(data.year);

            let info = data.info.split(",");
            //console.log(info);
            let room;
            let painting;
            info.forEach(function(value){
                if(value == "room_A"){
                    room = "A";
                } else if(value == "room_B"){
                    room = "B";
                } else if(value == "room_C"){
                    room = "C";
                } else if (!isNaN(parseFloat(value)) && isFinite(value)){ //https://stackoverflow.com/questions/5778020/check-whether-an-input-string-contains-a-number-in-javascript
                    painting = value;
                }
            });

            $("#roomnumber").text(room);
            $("#artNumber").text(room + painting);

        }).fail(function (err1, err2) {
            console.log('Fail');
            console.log(err1);
            console.log(err2);
        });

        // $.ajax({
        //     url: `http://localhost:3000/getOnePainting`,
        //     method: 'POST',
        //     data: {
        //         id: route.paintingsIDs[count]
        //     }
        // }).done(function (data) {
        //     //console.log(data);
        //     $("#gotoinf h2").text(data.title);
        //     $("#gotoinf h3").text(data.artist);
        //     $("#gotoinf p").text(data.year);

        //     let info = data.info.split(",");
        //     //console.log(info);
        //     let room;
        //     let painting;
        //     info.forEach(function(value){
        //         if(value == "room_A"){
        //             room = "A";
        //         } else if(value == "room_B"){
        //             room = "B";
        //         } else if(value == "room_C"){
        //             room = "C";
        //         } else if (!isNaN(parseFloat(value)) && isFinite(value)){ //https://stackoverflow.com/questions/5778020/check-whether-an-input-string-contains-a-number-in-javascript
        //             painting = value;
        //         }
        //     });

        //     $("#roomnumber").text(room);
        //     $("#artNumber").text(room + painting);

        // }).fail(function (err1, err2) {
        //     console.log('Fail');
        //     console.log(err1);
        //     console.log(err2);
        // });
    }

    $("#goto").on("click", function(){
        $('#route-instructions h1').remove();
        if(count == currentRoute.images.length - 1){
            window.location.replace("http://127.0.0.1:5500/feedbackintro.html");
        } else {
            count++;
        }
        displayRouteInstructions(currentRoute);
    })

    let getSelectedRoute = () => {
        //$('#loading_screen').show();
        let routeId = localStorage.getItem('selectedRoute');
        $.ajax({
            url: `http://localhost:3000/get_route_mongo/${routeId}`,
            method: 'GET'
        }).done(function (data) {
            currentRoute = data;
            $('#loading_screen').hide();
            if ($('#route-inf').length) {
                displaySelectedRoute(data);
            }
            if ($('#route-instructions').length) {
                displayRouteInstructions(data);
            }
        }).fail(function (err1, err2) {
            console.log('Fail');
            console.log(err1);
            console.log(err2);
        });
    }

    if ($('.carousel').length) {
        $.getJSON('http://localhost:3000/get_all_routes_mongo', function (d) {
            $('#loading_screen').hide();
            appendRoutes(d);
        }).fail(function (e1, e2) {
            console.log(e1);
            console.log(e2);
        });
    }

    if ($('#route-inf').length || $('#route-instructions').length) {
        getSelectedRoute();
    }

    if ($('.starrr').length) {
        $('.generated-rating').starrr().on('starrr:change', function (e, value) {
            updateRating("5e25a95c6d52f30c42ef39f9", value);
            window.location.href = "share.html";
        })
    }

    if($("#gr").css('display') == 'none'){
        $("#codeBtn").attr('href', "route_number.html");
    } else {
        $("#codeBtn").attr('href', "generator.html");
    }
});