$(function () {

    var group = {};
    var answers = {
        "practical": 0,
        "images": []
    };
    var count = 0;

    $("#addPerson").click(function (e) {
        e.preventDefault();
        var groupSize = $(".name").length;

        if (groupSize < 7) {
            $("#addPerson").before(
                $("<input>", {
                    "type": "text",
                    "placeholder": "name",
                    "class": "name"
                })
            ).before(
                $("<br>")
            );
        } else {
            $("#addPerson").after(
                $("<p>").text("The group is too big.")
            );
        }


    });

    $("body").on("click", "#next", function (e) {
        e.preventDefault();
        group.names = [];

        $(".name").each(function () {
            var name = $(this).val();
            if (name != "") {
                ;
                group.names.push(name);
            }

        });

        group.groupSize = group.names.length;
        //        console.log(group);

        $.ajax({
            "url": "http://localhost:3000/resetQuiz",
            "method": "GET"
        }).done(function () {
            nextQuestion();
        });


    });

    $("body").on("click", ".answer", function () {
        if (currentQuestionType == "practical") {
            answers.practical = $(this).val();
        } else {
            answers.images.push($(this).val());
        }

        if(count < 7){
            count++;
            nextQuestion();
        } else {
            group.answers = answers;

            $.ajax({
                "url": "http://localhost:3000/saveGroup",
                "method": "POST",
                "data": group
            }).done(function(e){
                console.log(group);
            })

            
        }
        
    });

    var currentQuestionType;

    function nextQuestion() {
        $(".generator").empty();
        $(".generator").append(
            $("<div>", {
                "class": "question"
            })
        );

        $.ajax({
            "url": "http://localhost:3000/getQuestion",
            "method": "GET"
        }).done(function (question) {
            currentQuestionType = question.type;
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

        question.answers.forEach(function (q) {
            var answer = "";
            if (question.type == "practical") {
                answer = q;
            } else {
                q.tags.forEach(function (tag) {
                    answer += " " + tag;
                });
            }
            $("#answers").append(
                $("<input>", {
                    "type": "radio",
                    "name": "answer",
                    "value": answer,
                    "class": "answer"
                })
            ).append(
                answer
            ).append($("<br>"));
        });
    }


});