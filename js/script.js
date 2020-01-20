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
                        <div>
                            <p>Rating:</p><img src="ui/images/rating-white.png">
                        </div>
                        <div>
                            <p>Duration:</p>
                            <p>2:45h</p>
                        </div>
                    </div>
                    <a href="routeinstructions.html">
                        <div class="btn">
                            <p>Select route</p>
                        </div>
                    </a>`)
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
            <button class="btn"><a href="routeinf.html">Read more</a></button>
        </figcaption>
    </figure>`);
        }

        $('.carousel figure img').click(function () {
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