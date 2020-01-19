$(function(){
// Update the count down every 1 second
let maxTime = 30;

var x = setInterval(function() {
    maxTime--;
  // Display the result in the element with id="demo"
  document.getElementById("demo").innerHTML = maxTime;

  // If the count down is finished, write some text
  if (maxTime == 0) {
    clearInterval(x);
  }
}, 1000);
});