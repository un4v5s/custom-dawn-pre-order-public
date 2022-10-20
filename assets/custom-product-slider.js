class CustomSliderComponent extends HTMLElement {
  constructor() {
    super();
    this.slider = this.querySelector('[id^="Slider-"]');
    this.sliderItems = this.querySelectorAll('[id^="Slide-"]');
    this.scrollbar = this.querySelector('.slider-scrollbar');
    this.scrollbarInner = this.querySelector('.slider-scrollbar__inner');
    this.enableSliderLooping = false;
    this.currentPageElement = this.querySelector('.slider-counter--current');
    this.pageTotalElement = this.querySelector('.slider-counter--total');
    this.prevButton = this.querySelector('button[name="previous"]');
    this.nextButton = this.querySelector('button[name="next"]');

    if (!this.slider || !this.nextButton) return;

    this.initPages();
    const resizeObserver = new ResizeObserver(entries => this.initPages());
    resizeObserver.observe(this.slider);

    this.slider.addEventListener('scroll', this.update.bind(this));
    this.slider.addEventListener('scroll', this.onScroll.bind(this));
    this.prevButton.addEventListener('click', this.onButtonClick.bind(this));
    this.nextButton.addEventListener('click', this.onButtonClick.bind(this));
  }

  initPages() {
    this.sliderItemsToShow = Array.from(this.sliderItems).filter(element => element.clientWidth > 0);
    if (this.sliderItemsToShow.length < 2) return;
    this.sliderItemOffset = this.sliderItemsToShow[1].offsetLeft - this.sliderItemsToShow[0].offsetLeft;
    this.slidesPerPage = Math.floor((this.slider.clientWidth - this.sliderItemsToShow[0].offsetLeft) / this.sliderItemOffset);
    this.totalPages = this.sliderItemsToShow.length - this.slidesPerPage + 1;
    const widths = this.sliderItemsToShow.map(e => e.offsetWidth);
    this.sliderTotalWidth = widths.reduce((partialSum, a) => partialSum + a, 0);

    this.update();
  }

  resetPages() {
    this.sliderItems = this.querySelectorAll('[id^="Slide-"]');
    this.initPages();
  }

  update() {
    const previousPage = this.currentPage;
    this.currentPage = Math.round(this.slider.scrollLeft / this.sliderItemOffset) + 1;

    if (this.currentPageElement && this.pageTotalElement) {
      this.currentPageElement.textContent = this.currentPage;
      this.pageTotalElement.textContent = this.totalPages;
    }

    if (this.currentPage != previousPage) {
      this.dispatchEvent(new CustomEvent('slideChanged', { detail: {
        currentPage: this.currentPage,
        currentElement: this.sliderItemsToShow[this.currentPage - 1]
      }}));
    }

    if (this.enableSliderLooping) return;

    if (this.isSlideVisible(this.sliderItemsToShow[0]) && this.slider.scrollLeft === 0) {
      this.prevButton.setAttribute('disabled', 'disabled');
    } else {
      this.prevButton.removeAttribute('disabled');
    }

    if (this.isSlideVisible(this.sliderItemsToShow[this.sliderItemsToShow.length - 1])) {
      this.nextButton.setAttribute('disabled', 'disabled');
    } else {
      this.nextButton.removeAttribute('disabled');
    }
  }

  isSlideVisible(element, offset = 0) {
    const lastVisibleSlide = this.slider.clientWidth + this.slider.scrollLeft - offset;
    return (element.offsetLeft + element.clientWidth) <= lastVisibleSlide && element.offsetLeft >= this.slider.scrollLeft;
  }

  onButtonClick(event) {
    event.preventDefault();
    const step = event.currentTarget.dataset.step || 1;
    this.slideScrollPosition = event.currentTarget.name === 'next' ? this.slider.scrollLeft + (step * this.sliderItemOffset) : this.slider.scrollLeft - (step * this.sliderItemOffset);
    this.slider.scrollTo({
      left: this.slideScrollPosition
    });
  }

  onScroll(event){
    const scrollbar = document.getElementsByClassName("slider-scrollbar__inner");
    if(scrollbar[0]){
      const ratio = (this.slider.scrollLeft) / this.sliderTotalWidth;
      const translatex = (this.scrollbar.offsetWidth) * ratio;
      if(translatex < this.scrollbar.offsetWidth - this.scrollbarInner.offsetWidth){
        scrollbar[0].style = "transform:translateX(" + (translatex) + "px)";
      }else{
        scrollbar[0].style = "transform:translateX(" + (this.scrollbar.offsetWidth - this.scrollbarInner.offsetWidth) + "px)";
      }
    }
  }
}

customElements.define('custom-slider-component', CustomSliderComponent);

class CustomMediaGallery extends HTMLElement {
  constructor() {
    super();
    this.elements = {
      liveRegion: this.querySelector('[id^="GalleryStatus"]'),
      viewer: this.querySelector('[id^="GalleryViewer"]')
    }
    this.mql = window.matchMedia('(min-width: 750px)');

  }

  setActiveMedia(mediaId, prepend) {
    const activeMedia = this.elements.viewer.querySelector(`[data-media-id="${ mediaId }"]`);
    this.elements.viewer.querySelectorAll('[data-media-id]').forEach((element) => {
      element.classList.remove('is-active');
    });
    activeMedia.classList.add('is-active');

    if (prepend) {
      activeMedia.parentElement.prepend(activeMedia);
      if (this.elements.viewer.slider) this.elements.viewer.resetPages();
    }

    this.preventStickyHeader();
    this.playActiveMedia(activeMedia);
  }

  announceLiveRegion(activeItem, position) {
    const image = activeItem.querySelector('.product__modal-opener--image img');
    if (!image) return;
    image.onload = () => {
      this.elements.liveRegion.setAttribute('aria-hidden', false);
      this.elements.liveRegion.innerHTML = window.accessibilityStrings.imageAvailable.replace(
        '[index]',
        position
      );
      setTimeout(() => {
        this.elements.liveRegion.setAttribute('aria-hidden', true);
      }, 2000);
    };
    image.src = image.src;
  }

  playActiveMedia(activeItem) {
    window.pauseAllMedia();
    const deferredMedia = activeItem.querySelector('.deferred-media');
    if (deferredMedia) deferredMedia.loadContent(false);
  }

  preventStickyHeader() {
    this.stickyHeader = this.stickyHeader || document.querySelector('sticky-header');
    if (!this.stickyHeader) return;
    this.stickyHeader.dispatchEvent(new Event('preventHeaderReveal'));
  }

  removeListSemantic() {
    if (!this.elements.viewer.slider) return;
    this.elements.viewer.slider.setAttribute('role', 'presentation');
    this.elements.viewer.sliderItems.forEach(slide => slide.setAttribute('role', 'presentation'));
  }
}

customElements.define('custom-media-gallery', CustomMediaGallery);
