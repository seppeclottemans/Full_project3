$(function () {
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
        $('#route-inf').append(`
            <h1>${route.name}</h1>
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
                            <button class="btn"><a href="routeinstructions.html">Select route</a></button>
        `)
        route.images.forEach(function (routeImg) {
            $('#route-gallery').append(`<img src="${routeImg}">`)
        });
        $('.existingroute-rating').starrr({
            rating: Math.round(route.rating)
        })
    }

    function updateRating(routeId, rating) {
        $.ajax({
            url: `http://localhost:3000/update_rating/${routeId}`,
            method: 'POST',
            data: {
                rating: rating
            }
        }).done(function (data) {

        }).fail(function (err1, err2) {
            console.log('Fail');
            console.log(err1);
            console.log(err2);
        });
    }

    let displayRouteInstructions = (route) => {
        $('#route-instructions').prepend(`<h1>${route.name}</h1>`)
    }

    let getSelectedRoute = () => {
        $('#loading_screen').show();
        let routeId = localStorage.getItem('selectedRoute');
        $.ajax({
            url: `http://localhost:3000/getRouteMongo/${routeId}`,
            method: 'GET'
        }).done(function (data) {
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
        $.getJSON('http://localhost:3000/getAllRoutesMongo', function (d) {
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
});