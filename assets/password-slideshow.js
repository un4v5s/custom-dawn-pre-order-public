window.addEventListener("DOMContentLoaded", function(e) {
  let slider = document.querySelector('[id^="Slider-"]');
  let fadeComplete = function(e) { 
    slider.appendChild(sliderItems[0]);
   };
  let sliderItems = slider.getElementsByClassName('slideshow__slide');
  for(let i=0; i < sliderItems.length; i++) {
    sliderItems[i].addEventListener("animationend", fadeComplete, false);
  }
}, false);

