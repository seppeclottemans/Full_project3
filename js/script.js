$(function () {
    let appendRoutes = (allRoutes) => {
        function getURLParameter(name) {
            return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
        }

        let getSelectedRoute = (allRoutes) => {
            let selectedRoute = getURLParameter('name');
            console.log(selectedRoute);
            for (let route of allRoutes) {
                if (route.name == selectedRoute) {
                    $('#route-inf').append(`
                    <img src="${route.images[0]}" alt="">
                    <p>${route.info}</p>
                    <div>
                        <div class="route-inf-extra">
                            <p>Rating:</p><img src="ui/images/rating-white.png">
                        </div>
                        <div class="route-inf-extra">
                            <p>Duration:</p>
                            <p>2:45h</p>
                        </div>
                    </div>
                    <button class="btn"><a href="routeinstructions.html">Select route</a></button>
`)
                }
            }
        }

        getSelectedRoute(allRoutes);

        for (let route of allRoutes) {
            $('.carousel').append(`<figure>
            <img src="${route.images[0]}" alt="">
       <figcaption>
            <h2 id="${route.name}">${route.name}</h2>
            <p>${route.info}</p>
            <button class="btn readmore"><a href="routeinf.html">Read more >></a></button>
        </figcaption>
    </figure>`);
        }

        $('.carousel figure img').click(function () {
            selectedRoute = $($($(this).siblings()[0]).children()[0]).attr('id');
            window.location.href = `routeinf.html?name=${selectedRoute}`
        });
        $('.carousel .readmore').click(function(){
            selectedRoute = $($($(this).siblings()[0]).children()[0]).attr('id');
            window.location.href = `routeinf.html?name=${selectedRoute}`
        });
    }

    $.getJSON('js/routes.json', function (d) {
        $('#loading_screen').hide();
        appendRoutes(d);
    }).fail(function (e1, e2) {
        console.log(e1);
        console.log(e2);
    });
});


getAllRoutesMongo();
// return all routes as array of object
function getAllRoutesMongo(){
    $.ajax({
        url: "http://localhost:3000/getAllRoutesMongo",
        method: 'GET'
    }).done(function (data) {
        console.log(data);
    }).fail(function (err1, err2) {
        console.log('Fail');
        console.log(err1);
        console.log(err2);
    });
}

function getRouteMongo(){
    // let routeId;
    $.ajax({
        url: `http://localhost:3000/getRouteMongo/${routeId}`,
        method: 'GET'
    }).done(function (data) {
        console.log(data);
    }).fail(function (err1, err2) {
        console.log('Fail');
        console.log(err1);
        console.log(err2);
    });
}
