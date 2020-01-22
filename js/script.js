$(function () {
    let displaySelectedRoute = (route) => {
        route = JSON.parse(route);
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
        $('.selections-rating').starrr().on('starrr:change', function (e, value) {
            console.log(value)
        })
        $('.generated-rating').starrr().on('starrr:change', function (e, value) {
            console.log(value)
        })
        $('.existingroute-rating').starrr({
            rating: 4
        })
    }

    let appendRoutes = (allRoutes) => {
        for (let route of allRoutes) {
            $('.carousel').append(`<figure>
           <a href="routeinf.html"><img src="${route.images[0]}" alt="" class="${route._id}"></a>
       <figcaption>
            <h2>${route.name}</h2>
            <p>${route.info}</p>
            <button class="btn readmore ${route.id}"><a href="routeinf.html">Read more >></a></button>
        </figcaption>
    </figure>`);
        }

        $('.carousel figure img').click(function () {
            let selectedRoute = $(this).attr('class');
            localStorage.setItem('selectedRoute', selectedRoute);
        });
        $('.carousel .readmore').click(function () {
            let selectedRoute = $(this).attr('class')[2];
            localStorage.setItem('selectedRoute', selectedRoute);
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

    if ($('#route-inf').length) {
        $('#loading_screen').show();
        let routeId = localStorage.getItem('selectedRoute');
        $.ajax({
            url: `http://localhost:3000/getRouteMongo/${routeId}`,
            method: 'GET'
        }).done(function (data) {
            $('#loading_screen').hide();
            displaySelectedRoute(data);
        }).fail(function (err1, err2) {
            console.log('Fail');
            console.log(err1);
            console.log(err2);
        });
    }
});