if (!customElements.get('product-modal')) {
  customElements.define('product-modal', class ProductModal extends ModalDialog {
    constructor() {
      super();
    }

    hide() {
      // removeTrapFocus events makes unexpected auto scroll on close modal, so not use this
      // super.hide();
      document.body.classList.remove('overflow-hidden');
      document.body.dispatchEvent(new CustomEvent('modalClosed'));
      this.removeAttribute('open');
      // removeTrapFocus(this.openedBy);
      window.pauseAllMedia();
    }

    show(opener) {
      super.show(opener);
      this.showActiveMedia();
    }

    showActiveMedia() {
      this.querySelectorAll(`[data-media-id]:not([data-media-id="${this.openedBy.getAttribute("data-media-id")}"])`).forEach((element) => {
          element.classList.remove('active');
        }
      )
      const activeMedia = this.querySelector(`[data-media-id="${this.openedBy.getAttribute("data-media-id")}"]`);
      const activeMediaTemplate = activeMedia.querySelector('template');
      const activeMediaContent = activeMediaTemplate ? activeMediaTemplate.content : null;
      activeMedia.classList.add('active');
      setTimeout(() => {
        activeMedia.scrollIntoView();
      }, 5);

      const container = this.querySelector('[role="document"]');
      container.scrollLeft = (activeMedia.width - container.clientWidth) / 2;

      if (activeMedia.nodeName == 'DEFERRED-MEDIA' && activeMediaContent && activeMediaContent.querySelector('.js-youtube'))
        activeMedia.loadContent();
    }
  });
}
