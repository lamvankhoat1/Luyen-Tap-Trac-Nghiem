// Get the button:
let button_scroll_to_top = document.querySelector("button.scroll-to-top");

// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    button_scroll_to_top.style.display = "block";
  } else {
    button_scroll_to_top.style.display = "none";
  }
}

// When the user clicks on the button, scroll to the top of the document
function scrollToTop() {
    window.scrollTo({top: 0, behavior: 'smooth'});
}