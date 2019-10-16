/*
  Quick quiz bootstrap extension
*/


;
(function ($) {

  // keep track of number of quizes added to page
  quiz_count = 0;

  // add jQuery selection method to create
  // quiz structure from question json file
  // "filename" can be path to question json
  // or javascript object
  $.fn.quiz = function (filename) {
    if (typeof filename === "string") {
      $.getJSON(filename, render.bind(this));
    } else {
      render.call(this, filename);
    }
  };

  // create html structure for quiz
  // using loaded questions json
  function render(quiz_opts) {


    // list of questions to insert into quiz
    questions = quiz_opts.questions;

    // keep track of the state of correct
    // answers to the quiz so far
    state = {
      correct: 0,
      total: questions.length
    };

    $quiz = $(this)
      .attr("class", "carousel slide")
      .attr("data-ride", "carousel");

    // unique ID for container to refer to in carousel
    name = $quiz.attr("id") || "urban_quiz_" + (++quiz_count);

    $quiz.attr('id', name);

    height = $quiz.height();


    /*
      Add carousel indicators
    */


    /*
      Slides container div
    */
    $slides = $("<div>")
      .attr("class", "carousel-inner")
      .attr("role", "listbox")
      .appendTo($quiz);

    /*
      Create title slide
    */
    $title_slide = $("<div>")
      .attr("class", "item active")
      .attr("height", height + "px")
      .appendTo($slides);

    $('<h1>')
      .text(quiz_opts.title)
      .attr('class', 'quiz-title')
      .appendTo($title_slide);

    $start_button = $("<div>")
      .attr("class", "quiz-answers")
      .appendTo($title_slide);

    $indicators = $('<ol>')
      .attr('class', 'progress-circles')

    $("<button>")
      .attr('class', 'quiz-button btn')
      .text("Սկսել թեստը!")
      .click(function () {
        $quiz.carousel('next');
        $indicators.addClass('show');

        $(".active .quiz-button.btn").each(function () {
          console.log(this.getBoundingClientRect())
          $(this).css("margin-left", function () {
            return ((250 - this.getBoundingClientRect().width) * 0.5) + "px"
          })
        })



      })
      .appendTo($start_button);

    $indicators
      .appendTo($quiz);

    $.each(questions, function (question_index, question) {
      $('<li>')
        .attr('class', question_index ? "" : "dark")
        .attr('id', 'li-' + question_index)
        .attr('style', 'cursor:pointer')
        .attr('title', 'question ' + (question_index + 1))
        .attr('data-id', question_index)
        .on('click', function(e){
          // $('.active').removeClass('active');
          // $('#item-' + e.target.dataset.id).addClass('active');
          $quiz.carousel(Number(e.target.dataset.id)+1);
          $('.dark').removeClass('dark');
          $('#li-' + e.target.dataset.id).addClass('dark');
        })
        .appendTo($indicators);
    });

    /*
      Add all question slides
    */
    $.each(questions, function (question_index, question) {

      var last_question = (question_index + 1 === state.total);

      var $item = $("<div>")
        .attr("class", "item")
        .attr("id", "item-" + question_index)
        .data('id', question_index)
        .attr("height", height + "px")
        .appendTo($slides);

      var $img_div;
      if (question.image) {
        $img_div = $('<div>')
          .attr('class', 'question-image')
          .appendTo($item);
        $("<img>")
          .attr("class", "img-responsive")
          .attr("src", question.image)
          .appendTo($img_div);
      }

      $("<div>")
        .attr("class", "quiz-question")
        .attr("id", "quiz-question-" + question_index)
        .html(question.prompt)
        .appendTo($item);

      var $answers = $("<div>")
        .attr("class", "quiz-answers")
        .appendTo($item);

      // if the question has an image
      // append a container with the image to the item


      // for each possible answer to the question
      // add a button with a click event
      $.each(question.answers, function (answer_index, answer) {

        // create an answer button div
        // and add to the answer container
        var ans_btn = $("<div>")
          .attr('class', 'quiz-button btn')
          .html(answer)
          .appendTo($answers);

        // This question is correct if it's
        // index is the correct index
        var correct = (question.correct.index === answer_index);

        // default opts for both outcomes
        var opts = {
          allowOutsideClick: false,
          allowEscapeKey: false,
          confirmButtonText: "Next Question",
          html: true,
          confirmButtonColor: "#121b1f"
        };

        // set options for correct/incorrect
        // answer dialogue
        if (correct) {
          opts = $.extend(opts, {
            title: "ճիշտ է!",
            text: "Շատ լավ է," + (
              question.correct.text ?
              ("<div class=\"correct-text\">" +
                question.correct.text +
                "</div>"
              ) : ""),
            type: "success"
          });
        } else {
          opts = $.extend(opts, {
            title: "Սխալ է!",
            text: (
              //"Սխալ է!<br/><br/>" +
              //"Ճիշտ պատասխանն է \"" +
              //question.answers[question.correct.index] + "\"." + (
                question.correct.text ?
                ("<div class=\"correct-text\">" +
                  question.correct.text +
                  "</div>"
                ) : ""//)
            ),
            type: "error"
          });
        }

        if (last_question) {
          opts.confirmButtonText = "Տես քո արյունքները․";
        }

        // bind click event to answer button,
        // using specified sweet alert options
        ans_btn.on('click', function () {

          function next() {
            // if correct answer is selected,
            // keep track in total
            if (correct) state.correct++;
            $quiz.carousel('next');

            // if we've reached the final question
            // set the results text
            if (last_question) {
              $results_title.html(resultsText(state));
              $results_ratio.text(
                "Ձեր պատասխանների " +
                Math.round(100 * (state.correct / state.total)) +
                "%֊ն է ճիշտ!"
              );
              $twitter_link.attr('href', tweet(state, quiz_opts));
              $facebook_link.attr('href', facebook(state, quiz_opts));
              $indicators.removeClass('show');
              // indicate the question number
              $indicators.find('li')
                .removeClass('dark')
                .eq(0)
                .addClass('dark');
            } else {
              // indicate the question number
              $indicators.find('li')
                .removeClass('dark')
                .eq(question_index + 1)
                .addClass('dark');
            }
            // unbind event handler
            $('.sweet-overlay').off('click', next);
          }

          // advance to next question on OK click or
          // click of overlay
          swal(opts, next);
          $('.sweet-overlay').on('click', next);

        });

      });


    });


    // final results slide
    var $results_slide = $("<div>")
      .attr("class", "item")
      .attr("height", height + "px")
      .appendTo($slides);

    var $results_title = $('<h1>')
      .attr('class', 'quiz-title')
      .appendTo($results_slide);

    var $results_ratio = $('<div>')
      .attr('class', 'results-ratio')
      .appendTo($results_slide);

    var $restart_button = $("<div>")
      .attr("class", "quiz-answers")
      .appendTo($results_slide);

    var $social = $("<div>")
      .attr('class', 'results-social')
      .html('<div id = "social-text">Ձեզ դուր եկավ թեստը? Կիսվիր դրանով ընկերների հետ!</div>')
      .appendTo($results_slide);

    var $twitter_link = $('<a>')
      .html('<span class="social social-twitter follow-tw"></span>')
      .appendTo($social);

    var $facebook_link = $('<a>')
      .html('<span class="social social-facebook follow-fb"></span>')
      .appendTo($social);

    $("<button>")
      .attr('class', 'quiz-button btn')
      .text("Փորձել կրկին?")
      .click(function () {
        state.correct = 0;
        $quiz.carousel(0);
      })
      .appendTo($restart_button);

    $quiz.carousel({
      "interval": false
    });

    $(window).on('resize', function () {
      $quiz.find(".item")
        .attr('height', $quiz.height() + "px");
    });
  }

  function resultsText(state) {

    var ratio = state.correct / state.total;
    var text;

    switch (true) {
      case (ratio === 1):
        text = "Հրաշալի արդյունք!";
        break;
      case (ratio > 0.9):
        text = "Շատ լավ է, պատասխանները մեծամասամբ ճիշտ էին.";
        break;
      case (ratio > 0.60):
        text = "Բավարար է, Դուք հանձնել եք թեստը նորմալ արդյունքներով.";
        break;
      case (ratio > 0.5):
        text = "Գոնե կեսը ճիշտ էր&hellip;";
        break;
      case (ratio < 0.5 && ratio !== 0):
        text = "Խորհուրդ ենք տալիս լինել ուշադիր և կրկին փորձել.";
        break;
      case (ratio === 0):
        text = "Լուրջ?";
        break;
    }
    return text;

  }


  function tweet(state, opts) {

    var body = (
      "I got " + state.correct +
      " out of " + state.total +
      " on " + opts.title +
      "\" quiz. Test your knowledge here: " + opts.url
    );

    return (
      "http://twitter.com/intent/tweet?text=" +
      encodeURIComponent(body)
    );

  }

  function facebook(state, opts) {
    return "https://www.facebook.com/sharer/sharer.php?u=" + opts.url;
  }


})(jQuery);


function nextquiz(){
 var current = Number($('.dark').data('id'));
 $('#li-' + current).removeClass('dark');
 $('#li-' + (current+1)).addClass('dark');
 $quiz.carousel('next');
}

function prevquiz(){
 var current = Number($('.dark').data('id'));
 $('#li-' + current).removeClass('dark');
 $('#li-' + (current-1)).addClass('dark');
 $quiz.carousel('prev');
}
