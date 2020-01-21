$(function () {
    const loadProgressionbalk = function (groupSize) {
        let numberBalk = groupSize;
        if (numberBalk > 4) {
            numberBalk = numberBalk + 1;
        } else {
            numberBalk = 5;
        }
        if (numberBalk = 5) {
            $("footer").append(balk5);
        } else if (numberBalk = 6) {
            $("footer").append(balk6);
        } else if (numberBalk = 7) {
            $("footer").append(balk7);
        } else if (numberBalk = 8) {
            $("footer").append(balk8);
        }

    };

    var group = {};
    var answers = {
        "practical": [],
        "images": []
    };
    var count = 0;

    $("#addPerson").click(function (e) {
        //e.preventDefault();
        var groupSize = $(".name").length;

        if (groupSize < 7) {
            $("#addPerson").before(
                $("<input>", {
                    "type": "text",
                    "placeholder": "name",
                    "class": "name"
                })
            );
        } else {
            $("#addPerson").after(
                $("<p>").text("The group is too big.")
            );
        }


    });

    $("body").on("click", "#next", function (e) {
        //e.preventDefault();
        group.names = [];

        $(".name").each(function () {
            var name = $(this).val();
            if (name != "") {
                group.names.push(name);
            }

        });

        group.groupSize = group.names.length;
        console.log(group);
        window.sessionStorage.setItem("group", JSON.stringify(group));

        $.ajax({
            "url": "http://localhost:3000/resetQuiz",
            "method": "GET"
        }).done(function () {
            loadProgressionbalk(group.groupSize);
            nextQuestion("1001");
        });


    });

    $("body").on("click", ".answer", function () {
        let nextQuestionID = "1001";
        if (currentQuestionType == "practical") {
            answers.practical.push($(this).attr("id"));
        } else {
            answers.images.push($(this).attr("id"));
            nextQuestionID = $(this).attr("id");
        }

        let group = JSON.parse(window.sessionStorage.getItem("group"));
        let questionCount = Math.max(group.groupSize, 5);

        if (count < questionCount) {
            count++;
            nextQuestion(nextQuestionID);
            colorBalk(count, questionCount);
        } else {
            group.answers = answers;

            $.ajax({
                "url": "http://localhost:3000/saveGroup",
                "method": "POST",
                "data": group
            }).done(function (recomms) {

                console.log(recomms);
                let selectedPaintings = [];
                recomms.forEach(function (recomm) {
                    selectedPaintings.push(recomm.id);
                });

                console.log(selectedPaintings);

                $.ajax({
                    url: "http://localhost:3000/getRoute",
                    method: "POST",
                    data: {
                        selectedPaintings: selectedPaintings
                    },
                }).done(function (route) {
                    console.log(route);

                    $(".generator").empty();
                    $(".generator").append(
                        $("<div>", {
                            "class": "recommended"
                        })
                    );

                    route.forEach(function (rout) {
                        $(".recommended").append(
                            $("<img>", {
                                "src": rout.image
                            })
                        )
                    });
                    saveRoute(route)
                })

            })
        }

    });

    function saveRoute(route) {
        let images = [];
        route.forEach(paintingInRoute => {
            images.push(paintingInRoute.image)
        });

        $.ajax({
            url: "http://localhost:3000/create-route",
            method: 'POST',
            data: {
                name: "custom_route",
                rating: 5,
                images: images,
                info: "Dit is een route gecureerd door de werknemers van het museum veel plezier tijdens uw bezoek."
            }
        }).done(function (data) {
            
        }).fail(function (err1, err2) {
            console.log('Fail');
            console.log(err1);
            console.log(err2);
        });
    }

    var currentQuestionType;
    let currentGroup = JSON.parse(window.sessionStorage.getItem("group"));
    let unusedUsers = currentGroup.names;

    function nextQuestion(answerID) {
        $(".generator").empty();
        $(".generator").append(
            $("<div>", {
                "class": "question"
            })
        );

        $.ajax({
            "url": "http://localhost:3000/getQuestion",
            "method": "POST",
            "data": {
                id: answerID
            }
        }).done(function (question) {
            currentQuestionType = question.type;
            if (currentGroup.groupSize > 1) {
                if (currentQuestionType == "image") {
                    let i = Math.floor(Math.random() * unusedUsers.length);
                    let currentUser = unusedUsers.pop(i);

                    if (currentUser == undefined) {
                        currentUser = "group"
                    }

                    $(".generator").append(
                        $("<div>", {
                            "class": "nameShouter"
                        }).text(currentUser + "'s turn")
                    );

                    $(".generator").append(
                        $("<div>", {
                            "id": "currentName"
                        }).text(currentUser)
                    );

                    setTimeout(function () {
                        $(".nameShouter").slideUp();
                    }, 2500);
                }
            }

            displayQuestion(question);
        });

    }

    function displayQuestion(question) {
        //console.log(question);

        $(".generator").append(
            $("<h2>").text(question.questionString)
        ).append(
            $("<div>", {
                "id": "answers"
            })
        );

        //console.log(question);

        question.answers.forEach(function (q) {
            //console.log(q);
            var answer;
            if (question.type == "practical") {
                answer = $("<div>", {
                    "class": "answer textanswer",
                    "id": q
                }).append(
                    q
                );
            } else {
                answer = $("<div>", {
                    "class": "answer imganswer",
                    "id": q.id
                }).append(
                    $("<img>", {
                        "src": q.image,
                    })
                );
            }
            $("#answers").append(
                answer
            ).append($("<br>"));
        });
    }


    const colorBalk = function (currentQuestion, totalQuestions) {
        let id = currentQuestion;
        console.log(currentQuestion);
        $(`footer svg #${id} rect`).removeClass();
        $(`footer svg #${id} rect`).addClass("st0");
        if (id == totalQuestions) {
            $(`footer svg #${id} path`).removeClass();
            $(`footer svg #${id} path`).addClass("st0");
            $(`footer #end g path`).removeClass();
            $(`footer #end g path`).addClass("st0");

        }
        if (id >= (totalQuestions / 2)) {
            $(`footer #midway g path`).removeClass();
            $(`footer #midway g path`).addClass("st0");
        }
    }
    const balk5 = `<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
         viewBox="0 0 318.5 29.5" style="enable-background:new 0 0 318.5 29.5;" xml:space="preserve">
    <style type="text/css">
        .st0{fill:#EC4F41;}
        .st1{fill:none;}
        .st2{fill:none;stroke:#EC4F41;}
    </style>
    <title>Asset 1</title>
    <g id="1">
        <path class="st0" d="M2.9,25.5H55v4.1H2.9c-1.6,0-2.9-0.9-2.9-2l0,0C0,26.4,1.3,25.5,2.9,25.5z"/>
        <path class="st0" d="M2.9,26h51.3l0,0v3l0,0H2.9c-1.2,0-2.2-0.7-2.2-1.5l0,0l0,0C0.7,26.7,1.7,26,2.9,26z"/>
    </g>
    <g id="5">
        <path class="st1" d="M263.4,25.5h52.1c1.6,0,2.9,0.9,2.9,2l0,0c0,1.1-1.3,2-2.9,2h-52.1V25.5z"/>
        <path class="st2" d="M264.2,26h51.3c1.2,0,2.2,0.7,2.2,1.5l0,0c0,0.8-1,1.5-2.2,1.5l0,0h-51.3l0,0l0,0V26L264.2,26z"/>
    </g>
    <g id="2">
        <rect x="65.9" y="25.5" class="st1" width="55" height="4.1"/>
        <rect x="66.6" y="26" class="st2" width="53.6" height="3"/>
    </g>
    <g id="3">
        <rect x="131.7" y="25.5" class="st1" width="55" height="4.1"/>
        <rect x="132.4" y="26" class="st2" width="53.6" height="3"/>
    </g>
    <g id="4">
        <rect x="197.6" y="25.5" class="st1" width="55" height="4.1"/>
        <rect x="198.3" y="26" class="st2" width="53.6" height="3"/>
    </g>
    <g id="end">
        <g id="Group_2">
            <path id="Path_6" class="st2" d="M310.8,0.5c-4,0-7.2,3.2-7.3,7.2c0,5,6.5,12.2,6.8,12.5c0.3,0.3,0.7,0.3,0.9,0c0,0,0,0,0,0
                c0,0,0,0,0,0c0.3-0.3,6.8-7.6,6.8-12.5C318,3.7,314.8,0.5,310.8,0.5z M310.8,11.4c-2,0-3.7-1.6-3.7-3.6s1.6-3.7,3.6-3.7
                c2,0,3.7,1.6,3.7,3.6c0,0,0,0,0,0l0,0C314.4,9.7,312.8,11.4,310.8,11.4z"/>
        </g>
    </g>
    <g id="begin">
        <g id="Group_2-2">
            <path id="Path_6-2" class="st0" d="M7.2,0.5C3.2,0.5,0,3.7,0,7.7c0,0,0,0,0,0c0,5,6.5,12.3,6.8,12.5c0.3,0.3,0.7,0.3,0.9,0
                c0,0,0,0,0,0c0,0,0,0,0.1,0C8,20,14.5,12.7,14.5,7.7C14.5,3.7,11.2,0.5,7.2,0.5z M7.2,11.4c-2,0-3.7-1.6-3.7-3.7s1.6-3.7,3.6-3.7
                c2,0,3.7,1.6,3.7,3.6c0,0,0,0,0,0l0,0C10.9,9.8,9.3,11.4,7.2,11.4z"/>
        </g>
    </g>
    <g id="midway">
        <g id="Group_2-3">
            <path id="Path_6-3" class="st2" d="M159,0.5c-4,0-7.2,3.2-7.2,7.2c0,0,0,0,0,0c0,5,6.5,12.2,6.8,12.5c0.3,0.3,0.7,0.3,0.9,0
                c0,0,0,0,0,0h0.1c0.3-0.3,6.8-7.6,6.8-12.5C166.2,3.7,163,0.5,159,0.5z M159,11.4c-2,0-3.7-1.6-3.7-3.6s1.6-3.7,3.6-3.7
                c2,0,3.7,1.6,3.7,3.6c0,0,0,0,0,0l0,0C162.6,9.7,161,11.4,159,11.4z"/>
        </g>
    </g>
    </svg>
    `;
    const balk6 = `<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
         viewBox="0 0 318.5 29.5" style="enable-background:new 0 0 318.5 29.5;" xml:space="preserve">
    <style type="text/css">
        .st0{fill:#EC4F41;}
        .st1{fill:none;}
        .st2{fill:none;stroke:#EC4F41;}
    </style>
    <title>Asset 1</title>
    <g id="1">
        <path class="st0" d="M2,25.5h45.5v4.1H2c-1.4,0-2.5-0.9-2.5-2l0,0C-0.5,26.4,0.6,25.5,2,25.5z"/>
        <path class="st0" d="M2,26h44.8l0,0v3l0,0H2c-1,0-1.9-0.7-1.9-1.5l0,0l0,0C0.1,26.7,1,26,2,26z"/>
    </g>
    <g id="6">
        <path class="st1" d="M270.9,25.5h45.5c1.4,0,2.5,0.9,2.5,2l0,0c0,1.1-1.1,2-2.5,2h-45.5V25.5z"/>
        <path class="st2" d="M271.6,26h44.8c1,0,1.9,0.7,1.9,1.5l0,0c0,0.8-0.8,1.5-1.9,1.5l0,0h-44.8l0,0l0,0V26L271.6,26z"/>
    </g>
    <g id="2">
        <rect x="53.8" y="25.5" class="st1" width="48" height="4.1"/>
        <rect x="54.4" y="26" class="st2" width="46.7" height="3"/>
    </g>
    <g id="3">
        <rect x="108.1" y="25.5" class="st1" width="48" height="4.1"/>
        <rect x="108.7" y="26" class="st2" width="46.7" height="3"/>
    </g>
    <g id="4">
        <rect x="162.3" y="25.5" class="st1" width="48" height="4.1"/>
        <rect x="163" y="26" class="st2" width="46.7" height="3"/>
    </g>
    <g id="5">
        <rect x="216.6" y="25.5" class="st1" width="48" height="4.1"/>
        <rect x="217.3" y="26" class="st2" width="46.7" height="3"/>
    </g>
    <g id="end">
        <g id="Group_2">
            <path id="Path_6" class="st2" d="M310.8,0.5c-4,0-7.2,3.2-7.3,7.2c0,5,6.5,12.2,6.8,12.5c0.3,0.3,0.7,0.3,0.9,0c0,0,0,0,0,0
                c0,0,0,0,0,0c0.3-0.3,6.8-7.6,6.8-12.5C318,3.7,314.8,0.5,310.8,0.5z M310.8,11.4c-2,0-3.7-1.6-3.7-3.6s1.6-3.7,3.6-3.7
                c2,0,3.7,1.6,3.7,3.6c0,0,0,0,0,0l0,0C314.4,9.7,312.8,11.4,310.8,11.4z"/>
        </g>
    </g>
    <g id="begin">
        <g id="Group_2-2">
            <path id="Path_6-2" class="st0" d="M7.2,0.5C3.2,0.5,0,3.7,0,7.7c0,0,0,0,0,0c0,5,6.5,12.3,6.8,12.5c0.3,0.3,0.7,0.3,0.9,0
                c0,0,0,0,0,0c0,0,0,0,0.1,0C8,20,14.5,12.7,14.5,7.7C14.5,3.7,11.2,0.5,7.2,0.5z M7.2,11.4c-2,0-3.7-1.6-3.7-3.7s1.6-3.7,3.6-3.7
                c2,0,3.7,1.6,3.7,3.6c0,0,0,0,0,0l0,0C10.9,9.8,9.3,11.4,7.2,11.4z"/>
        </g>
    </g>
    <g id="midway">
        <g id="Group_2-3">
            <path id="Path_6-3" class="st2" d="M159,0.5c-4,0-7.2,3.2-7.2,7.2c0,0,0,0,0,0c0,5,6.5,12.2,6.8,12.5c0.3,0.3,0.7,0.3,0.9,0
                c0,0,0,0,0,0h0.1c0.3-0.3,6.8-7.6,6.8-12.5C166.2,3.7,163,0.5,159,0.5z M159,11.4c-2,0-3.7-1.6-3.7-3.6s1.6-3.7,3.6-3.7
                c2,0,3.7,1.6,3.7,3.6c0,0,0,0,0,0l0,0C162.6,9.7,161,11.4,159,11.4z"/>
        </g>
    </g>
    </svg>`;
    const balk7 = `<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
         viewBox="0 0 318.5 29.5" style="enable-background:new 0 0 318.5 29.5;" xml:space="preserve">
    <style type="text/css">
        .st0{fill:#EC4F41;}
        .st1{fill:none;}
        .st2{fill:none;stroke:#EC4F41;}
    </style>
    <title>Asset 1</title>
    <g id="1">
        <path class="st0" d="M1.9,25.5h38.8v4.1H1.9c-1.2,0-2.2-0.9-2.2-2l0,0C-0.3,26.4,0.7,25.5,1.9,25.5z"/>
        <path class="st0" d="M1.9,26h38.3l0,0v3l0,0H1.9c-0.9,0-1.6-0.7-1.6-1.5l0,0l0,0C0.3,26.7,1,26,1.9,26z"/>
    </g>
    <g id="7">
        <path class="st1" d="M277.3,25.5h38.8c1.2,0,2.2,0.9,2.2,2l0,0c0,1.1-1,2-2.2,2h-38.8V25.5z"/>
        <path class="st2" d="M277.8,26h38.3c0.9,0,1.6,0.7,1.6,1.5l0,0c0,0.8-0.7,1.5-1.6,1.5l0,0h-38.3l0,0l0,0V26L277.8,26z"/>
    </g>
    <g id="2">
        <rect x="46" y="25.5" class="st1" width="41" height="4.1"/>
        <rect x="46.5" y="26" class="st2" width="39.9" height="3"/>
    </g>
    <g id="3">
        <rect x="92.2" y="25.5" class="st1" width="41" height="4.1"/>
        <rect x="92.8" y="26" class="st2" width="39.9" height="3"/>
    </g>
    <g id="4">
        <rect x="138.5" y="25.5" class="st1" width="41" height="4.1"/>
        <rect x="139" y="26" class="st2" width="39.9" height="3"/>
    </g>
    <g id="5">
        <rect x="184.8" y="25.5" class="st1" width="41" height="4.1"/>
        <rect x="185.3" y="26" class="st2" width="39.9" height="3"/>
    </g>
    <g id="6">
        <rect x="231" y="25.5" class="st1" width="41" height="4.1"/>
        <rect x="231.5" y="26" class="st2" width="39.9" height="3"/>
    </g>
    <g id="end">
        <g id="Group_2">
            <path id="Path_6" class="st2" d="M310.8,0.5c-4,0-7.2,3.2-7.3,7.2c0,5,6.5,12.2,6.8,12.5c0.3,0.3,0.7,0.3,0.9,0c0,0,0,0,0,0
                c0,0,0,0,0,0c0.3-0.3,6.8-7.6,6.8-12.5C318,3.7,314.8,0.5,310.8,0.5z M310.8,11.4c-2,0-3.7-1.6-3.7-3.6s1.6-3.7,3.6-3.7
                c2,0,3.7,1.6,3.7,3.6c0,0,0,0,0,0l0,0C314.4,9.7,312.8,11.4,310.8,11.4z"/>
        </g>
    </g>
    <g id="begin">
        <g id="Group_2-2">
            <path id="Path_6-2" class="st0" d="M7.2,0.5C3.2,0.5,0,3.7,0,7.7c0,0,0,0,0,0c0,5,6.5,12.3,6.8,12.5c0.3,0.3,0.7,0.3,0.9,0
                c0,0,0,0,0,0c0,0,0,0,0.1,0C8,20,14.5,12.7,14.5,7.7C14.5,3.7,11.2,0.5,7.2,0.5z M7.2,11.4c-2,0-3.7-1.6-3.7-3.7s1.6-3.7,3.6-3.7
                c2,0,3.7,1.6,3.7,3.6c0,0,0,0,0,0l0,0C10.9,9.8,9.3,11.4,7.2,11.4z"/>
        </g>
    </g>
    <g id="midway">
        <g id="Group_2-3">
            <path id="Path_6-3" class="st2" d="M159,0.5c-4,0-7.2,3.2-7.2,7.2c0,0,0,0,0,0c0,5,6.5,12.2,6.8,12.5c0.3,0.3,0.7,0.3,0.9,0
                c0,0,0,0,0,0h0.1c0.3-0.3,6.8-7.6,6.8-12.5C166.2,3.7,163,0.5,159,0.5z M159,11.4c-2,0-3.7-1.6-3.7-3.6s1.6-3.7,3.6-3.7
                c2,0,3.7,1.6,3.7,3.6c0,0,0,0,0,0l0,0C162.6,9.7,161,11.4,159,11.4z"/>
        </g>
    </g>
    </svg>`;
    const balk8 = `<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
         viewBox="0 0 318.5 29.5" style="enable-background:new 0 0 318.5 29.5;" xml:space="preserve">
    <style type="text/css">
        .st0{fill:#EC4F41;}
        .st1{fill:none;}
        .st2{fill:none;stroke:#EC4F41;}
    </style>
    <title>Asset 1</title>
    <g id="1">
        <path class="st0" d="M2,25.5h36v4H2c-1.1,0-2-0.9-2-2l0,0C0,26.4,0.9,25.5,2,25.5z"/>
        <path class="st0" d="M2,26h35.5l0,0v3l0,0H2c-0.8,0-1.5-0.7-1.5-1.5l0,0l0,0C0.5,26.7,1.2,26,2,26z"/>
    </g>
    <g id="8">
        <path class="st1" d="M280,25.5h36c1.1,0,2,0.9,2,2l0,0c0,1.1-0.9,2-2,2h-36V25.5z"/>
        <path class="st2" d="M280.5,26H316c0.8,0,1.5,0.7,1.5,1.5l0,0c0,0.8-0.7,1.5-1.5,1.5l0,0h-35.5l0,0l0,0V26L280.5,26z"/>
    </g>
    <g id="2">
        <rect x="40" y="25.5" class="st1" width="38" height="4"/>
        <rect x="40.5" y="26" class="st2" width="37" height="3"/>
    </g>
    <g id="3">
        <rect x="80" y="25.5" class="st1" width="38" height="4"/>
        <rect x="80.5" y="26" class="st2" width="37" height="3"/>
    </g>
    <g id="4">
        <rect x="120" y="25.5" class="st1" width="38" height="4"/>
        <rect x="120.5" y="26" class="st2" width="37" height="3"/>
    </g>
    <g id="5">
        <rect x="160" y="25.5" class="st1" width="38" height="4"/>
        <rect x="160.5" y="26" class="st2" width="37" height="3"/>
    </g>
    <g id="6">
        <rect x="200" y="25.5" class="st1" width="38" height="4"/>
        <rect x="200.5" y="26" class="st2" width="37" height="3"/>
    </g>
    <g id="7">
        <rect x="240" y="25.5" class="st1" width="38" height="4"/>
        <rect x="240.5" y="26" class="st2" width="37" height="3"/>
    </g>
    <g id="end">
        <g id="Group_2">
            <path id="Path_6" class="st2" d="M310.8,0.5c-4,0-7.2,3.2-7.3,7.2c0,5,6.5,12.2,6.8,12.5c0.3,0.3,0.7,0.3,0.9,0c0,0,0,0,0,0
                c0,0,0,0,0,0c0.3-0.3,6.8-7.6,6.8-12.5C318,3.7,314.8,0.5,310.8,0.5z M310.8,11.4c-2,0-3.7-1.6-3.7-3.6s1.6-3.7,3.6-3.7
                c2,0,3.7,1.6,3.7,3.6c0,0,0,0,0,0l0,0C314.4,9.7,312.8,11.4,310.8,11.4z"/>
        </g>
    </g>
    <g id="begin">
        <g id="Group_2-2">
            <path id="Path_6-2" class="st0" d="M7.2,0.5C3.2,0.5,0,3.7,0,7.7c0,0,0,0,0,0c0,5,6.5,12.3,6.8,12.5c0.3,0.3,0.7,0.3,0.9,0
                c0,0,0,0,0,0c0,0,0,0,0.1,0C8,20,14.5,12.7,14.5,7.7C14.5,3.7,11.2,0.5,7.2,0.5z M7.2,11.4c-2,0-3.7-1.6-3.7-3.7s1.6-3.7,3.6-3.7
                c2,0,3.7,1.6,3.7,3.6c0,0,0,0,0,0l0,0C10.9,9.8,9.3,11.4,7.2,11.4z"/>
        </g>
    </g>
    <g id="midway>
        <g id="Group_2-3">
            <path id="Path_6-3" class="st2" d="M159,0.5c-4,0-7.2,3.2-7.2,7.2c0,0,0,0,0,0c0,5,6.5,12.2,6.8,12.5c0.3,0.3,0.7,0.3,0.9,0
                c0,0,0,0,0,0h0.1c0.3-0.3,6.8-7.6,6.8-12.5C166.2,3.7,163,0.5,159,0.5z M159,11.4c-2,0-3.7-1.6-3.7-3.6s1.6-3.7,3.6-3.7
                c2,0,3.7,1.6,3.7,3.6c0,0,0,0,0,0l0,0C162.6,9.7,161,11.4,159,11.4z"/>
        </g>
    </g>
    </svg>
    `;


});