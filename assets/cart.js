class CartRemoveButton extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('click', (event) => {
      event.preventDefault();
      const cartItems = this.closest('cart-items') || this.closest('cart-drawer-items');
      cartItems.updateQuantity(this.dataset.index, 0);
    });
  }
}

customElements.define('cart-remove-button', CartRemoveButton);

class CartItems extends HTMLElement {
  constructor() {
    super();

    this.lineItemStatusElement = document.getElementById('shopping-cart-line-item-status') || document.getElementById('CartDrawer-LineItemStatus');

    this.currentItemCount = Array.from(this.querySelectorAll('[name="updates[]"]'))
      .reduce((total, quantityInput) => total + parseInt(quantityInput.value), 0);

    this.debouncedOnChange = debounce((event) => {
      this.onChange(event);
    }, 300);

    this.addEventListener('change', this.debouncedOnChange.bind(this));

    if(this.nodeName == "CART-ITEMS"){
      this.checkAndUpdateCartItems(); // check on load in cart page
      const cartButtonId = 'checkout';
      const hiddenCartButtonId = 'checkout-hidden';
      document.getElementById(cartButtonId).addEventListener('click', (event) => {
        event.preventDefault();
        this.onSubmit(event, hiddenCartButtonId);
      })

      document.getElementById("dynamic-checkout-cover-button").addEventListener('click', (event) => {
        this.checkAndUpdateCartItems(true);
      })
    }
  }

  async onSubmit(event, hiddenCartButtonId) {
    const async_result = await this.checkAndUpdateCartItems(true);
    if(async_result == true){
      console.log("some changes detected");

    }else{
      console.log("no changes detected in delivery_date and pre-order period");
      document.getElementById(hiddenCartButtonId).click();
    }
  }

  onChange(event) {
    this.updateQuantity(event.target.dataset.index, event.target.value, document.activeElement.getAttribute('name'));
  }

  getSectionsToRender() {
    return [
      {
        id: 'main-cart-items',
        section: document.getElementById('main-cart-items').dataset.id,
        selector: '.js-contents',
      },
      {
        id: 'cart-icon-bubble',
        section: 'cart-icon-bubble',
        selector: '.shopify-section'
      },
      {
        id: 'cart-live-region-text',
        section: 'cart-live-region-text',
        selector: '.shopify-section'
      },
      {
        id: 'main-cart-footer',
        section: document.getElementById('main-cart-footer').dataset.id,
        selector: '.js-contents',
      }
    ];
  }

  updateQuantity(line, quantity, name) {
    // console.log("updateQuantity: ");
    this.enableLoading(line);
    // console.log("this: ", this);
    // console.log("getSectionsToRender(): ", this.getSectionsToRender());

    const body = JSON.stringify({
      line,
      quantity,
      sections: this.getSectionsToRender().map((section) => section.section),
      sections_url: window.location.pathname
    });
    // console.log("body: ", body);

    fetch(`${routes.cart_change_url}`, { ...fetchConfig(), ...{ body } })
      .then((response) => {
        return response.text();
      })
      .then((state) => {
        const parsedState = JSON.parse(state);
        // console.log("parsedState: ", parsedState);
        this.classList.toggle('is-empty', parsedState.item_count === 0);
        const cartDrawerWrapper = document.querySelector('cart-drawer');
        const cartFooter = document.getElementById('main-cart-footer');

        if (cartFooter) cartFooter.classList.toggle('is-empty', parsedState.item_count === 0);
        if (cartDrawerWrapper) cartDrawerWrapper.classList.toggle('is-empty', parsedState.item_count === 0);

        this.getSectionsToRender().forEach((section => {
          const elementToReplace =
            document.getElementById(section.id).querySelector(section.selector) || document.getElementById(section.id);
          elementToReplace.innerHTML =
            this.getSectionInnerHTML(parsedState.sections[section.section], section.selector);
        }));

        this.updateLiveRegions(line, parsedState.item_count);
        const lineItem = document.getElementById(`CartItem-${line}`) || document.getElementById(`CartDrawer-Item-${line}`);
        if (lineItem && lineItem.querySelector(`[name="${name}"]`)) {
          cartDrawerWrapper ? trapFocus(cartDrawerWrapper, lineItem.querySelector(`[name="${name}"]`)) : lineItem.querySelector(`[name="${name}"]`).focus();
        } else if (parsedState.item_count === 0 && cartDrawerWrapper) {
          trapFocus(cartDrawerWrapper.querySelector('.drawer__inner-empty'), cartDrawerWrapper.querySelector('a'))
        } else if (document.querySelector('.cart-item') && cartDrawerWrapper) {
          trapFocus(cartDrawerWrapper, document.querySelector('.cart-item__name'))
        }
        this.disableLoading();
        
      }).catch(() => {
        this.querySelectorAll('.loading-overlay').forEach((overlay) => overlay.classList.add('hidden'));
        const errors = document.querySelector('#cart-errors > .cart-error__contents') || document.querySelector('#CartDrawer-CartErrors > .cart-drawer-error__contents');
        errors.textContent = window.cartStrings.error;
        this.disableLoading();
      });
  }

  updateLiveRegions(line, itemCount) {
    if (this.currentItemCount === itemCount) {
      const lineItemError = document.getElementById(`Line-item-error-${line}`) || document.getElementById(`CartDrawer-LineItemError-${line}`);
      const quantityElement = document.getElementById(`Quantity-${line}`) || document.getElementById(`Drawer-quantity-${line}`);
      lineItemError
        .querySelector('.cart-item__error-text')
        .innerHTML = window.cartStrings.quantityError.replace(
          '[quantity]',
          quantityElement.value
        );
    }

    this.currentItemCount = itemCount;
    this.lineItemStatusElement.setAttribute('aria-hidden', true);

    const cartStatus = document.getElementById('cart-live-region-text') || document.getElementById('CartDrawer-LiveRegionText');
    cartStatus.setAttribute('aria-hidden', false);

    setTimeout(() => {
      cartStatus.setAttribute('aria-hidden', true);
    }, 1000);
  }

  getSectionInnerHTML(html, selector) {
    return new DOMParser()
      .parseFromString(html, 'text/html')
      .querySelector(selector).innerHTML;
  }

  enableLoading(line) {
    const mainCartItems = document.getElementById('main-cart-items') || document.getElementById('CartDrawer-CartItems');
    mainCartItems.classList.add('cart__items--disabled');

    const cartItemElements = this.querySelectorAll(`#CartItem-${line} .loading-overlay`);
    const cartDrawerItemElements = this.querySelectorAll(`#CartDrawer-Item-${line} .loading-overlay`);

    [...cartItemElements, ...cartDrawerItemElements].forEach((overlay) => overlay.classList.remove('hidden'));

    document.activeElement.blur();
    this.lineItemStatusElement.setAttribute('aria-hidden', false);
  }

  disableLoading() {
    const mainCartItems = document.getElementById('main-cart-items') || document.getElementById('CartDrawer-CartItems');
    mainCartItems.classList.remove('cart__items--disabled');
  }

  getDeliveryDateWithTerm(delivery_date){
    const month = delivery_date.substr(5, 2);
    const month_en = new Date(delivery_date).toLocaleString('en-us', { month: 'long' });
    const day = delivery_date.substr(delivery_date.length -2);
    const day_int = Number(day);

    let term_str;
    let is_ja = Shopify.locale == "ja";
    if(day_int <= 10){
      term_str = is_ja ? "初旬" : "early";
    }else if(day_int <= 20){
      term_str = is_ja ? "中旬" : "mid";
    }else if(day_int <= 31){
      term_str = is_ja ? "末" : "late";
    }
    if( is_ja ){
      return "" + Number(month) + "月" + term_str;
    }else{
      return term_str + " " + month_en;
    }
  }

  updateLiveRegionsDeliveryDate(old_line_item_key, body) {
    const {oldDeliveryDate:oldDate, properties:{_delivery_date:newDate}, updateType} = body;
    // console.log("updateLiveRegions");
    const variant_id = old_line_item_key.split(":")[0];

    const oldDateJp = this.getDeliveryDateWithTerm(oldDate);
    const newDateJp = this.getDeliveryDateWithTerm(newDate);

    const lineItemError = document.querySelector(`[data-line-item-key^="${variant_id}"] [id^="Line-item-error-"]`) 
      || document.querySelector(`cart-drawer [data-line-item-key^="${variant_id}"] [id^="CartDrawer-LineItemError-"]`);
    let html = "";
    switch(updateType){
      case "change":
        html = window.cartStrings.deliveryDateChangedWarning
          .replace('[oldDate]',oldDateJp)
          .replace('[newDate]',newDateJp);
        break;
      case "nullToNotNull":
        html = window.cartStrings.deliveryDateChangedWarningNullToNotNull
          .replace('[newDate]',newDateJp);
        break;
      case "notNullToNull":
        html = window.cartStrings.deliveryDateChangedWarningNotNullToNull
        break;

      default: break;        
    }
    lineItemError.querySelector('.cart-item__error-text').innerHTML = html;

    this.lineItemStatusElement.setAttribute('aria-hidden', true);
    const cartStatus = document.getElementById('cart-live-region-text') || document.getElementById('CartDrawer-LiveRegionText');
    cartStatus.setAttribute('aria-hidden', false);

    setTimeout(() => {
      cartStatus.setAttribute('aria-hidden', true);
    }, 1000);
  }

  setTime235959(date){
    if(typeof date == "string") date = new Date(date);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
  }

  setTime000000(date){
    if(typeof date == "string") date = new Date(date);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
  }

  checkSalesPeriod(){
    let bodyarr = [], linearr = [];
    const elms = this.nodeName == "CART-ITEMS" ? document.querySelectorAll('[id^="CartItem-"]') : document.querySelectorAll('[id^="CartDrawer-Item-"]');
    elms.forEach(element => {
      const productActiveDateEnd = element.querySelector('[name="product-metafield-active-date-end"]');
      if(productActiveDateEnd?.value) { // null, '' both falsy
        const line = element.dataset.index;
        const line_item_key = element.dataset.lineItemKey;
        const item_title = element.querySelector('[name="item-title"]').value;
        const productActiveDateEndString = productActiveDateEnd.value;
        if(this.setTime235959(productActiveDateEndString) < new Date()){
          console.log("sales period end in cart items");
          const body = {        
            'id': line_item_key,
            'quantity': 0,
            'oldItemTitle': item_title
          };
          bodyarr.push(body);
          linearr.push(line);
        }
      }
    })
    return {bodyarr, linearr};
  }

  checkDeliveryDate(salesPeriodExpiredIds){
    let bodyarr = [], linearr = [];

    // console.log("this.nodeName: ", this.nodeName);
    const elms = this.nodeName == "CART-ITEMS" ? document.querySelectorAll('[id^="CartItem-"]') : document.querySelectorAll('[id^="CartDrawer-Item-"]');
    elms.forEach(element => {
      const productDeliveryDate = element.querySelector('[name="product-metafield-delivery-date"]');
      const lineItemPropertyDeliveryDate = element.querySelector('[name="item-property-delivery-date"]');
      const line = element.dataset.index;
      const line_item_key = element.dataset.lineItemKey;

      const productDeliveryDateString = productDeliveryDate?.value;
      const lineItemPropertyDeliveryDateString = lineItemPropertyDeliveryDate?.value
      const deliveryDateWithTermKey = Shopify.locale == "ja" ? "納品予定" : "Delivery Date";
      let deliveryDateWithTerm, updateType;
      
      // pattern1: both not null
      if(productDeliveryDate?.value && lineItemPropertyDeliveryDate?.value){
        if(productDeliveryDate.value == lineItemPropertyDeliveryDate.value) return; // continue forEach loop if equals
        console.log("lineItemPropertyDeliveryDate changed");
        deliveryDateWithTerm = this.getDeliveryDateWithTerm(productDeliveryDateString);
        updateType = "change";

      // pattern2: only product not null
      }else if(productDeliveryDate?.value && !lineItemPropertyDeliveryDate?.value){ //null, '' both falsy
        console.log("lineItemPropertyDeliveryDate nullToNotNull");
        deliveryDateWithTerm = this.getDeliveryDateWithTerm(productDeliveryDateString);
        updateType = "nullToNotNull";

      // pattern3: only lineItem not null
      }else if(!productDeliveryDate?.value && lineItemPropertyDeliveryDate?.value){
        console.log("lineItemPropertyDeliveryDate notNullToNull");
        deliveryDateWithTerm = "";
        updateType = "notNullToNull";

      // pattern4: both null
      }else{
        return; // continue forEach loop
      }

      const body = {  
        'id': line_item_key,      
        'properties': { 
          '_delivery_date': productDeliveryDateString,
          [deliveryDateWithTermKey]: deliveryDateWithTerm
        },
        'oldDeliveryDate': lineItemPropertyDeliveryDateString, // later use this value
        'deliveryDateWithTerm': deliveryDateWithTerm, // later use this value
        'updateType': updateType // later use this value
      };
      if(!salesPeriodExpiredIds.includes(line)){
        bodyarr.push(body); // if period expired, line item delete, so unneeded to add
        linearr.push(line);
      }
    })
    return {bodyarr, linearr};
  }

  async reRenderSections(){
    const sections = this.getSectionsToRender().map((section) => section.section);
    // console.log("sections: ", sections);
    const sectionsReqUrl = `${window.location.pathname}?sections=${sections.join(",")}`;
    const sectionsResponce = await fetch(sectionsReqUrl).then(r => r.json());

    this.getSectionsToRender().forEach((section => {
      const elementToReplace =
        document.getElementById(section.id).querySelector(section.selector) || document.getElementById(section.id);
      elementToReplace.innerHTML =
        this.getSectionInnerHTML(sectionsResponce[section.section], section.selector);
    }));
    console.log("sections rerendered");
  }

  async checkAndUpdateCartItems(reRenderSections = false) {
    if(reRenderSections == true) await this.reRenderSections();

    const arrSalesPeriod = this.checkSalesPeriod();
    const salesPeriodExpiredIds = arrSalesPeriod.bodyarr ? arrSalesPeriod.bodyarr.map(e => e.line) : [];
    const arrDeliveryDate = this.checkDeliveryDate(salesPeriodExpiredIds);
    const bodies = [...arrSalesPeriod.bodyarr, ...arrDeliveryDate.bodyarr];
    console.log("bodies: ", bodies);

    const lines = [...arrSalesPeriod.linearr, ...arrDeliveryDate.linearr];
    const line_item_keys = bodies.map(e => e.id);
    lines.map(line => this.enableLoading(line));

    if(bodies.length == 0) return false;

    const responses = [];
    for(const body_json of bodies){
      const body = JSON.stringify(body_json);
      const res = await fetch(`${routes.cart_change_url}`, { ...fetchConfig(), ...{body} })
        .then(r => r.text())
        .catch(error => { 
          this.querySelectorAll('.loading-overlay').forEach((overlay) => overlay.classList.add('hidden'));
          const errors = document.querySelector('#cart-errors > .cart-error__contents') || document.querySelector('#CartDrawer-CartErrors > .cart-drawer-error__contents');
          errors.textContent = window.cartStrings.error;
          errors.parentNode.classList.remove("hide");
          this.disableLoading();
          return {error};
        })
      responses.push(res);
    }
    // console.log("responses: ", responses);

    // first, re-render section
    await this.reRenderSections();

    // second, handle response
    const lastParsedState = JSON.parse(responses[responses.length - 1]);
    this.classList.toggle('is-empty', lastParsedState.item_count === 0);
    const cartDrawerWrapper = document.querySelector('cart-drawer');
    const cartFooter = document.getElementById('main-cart-footer');
    if (cartFooter) cartFooter.classList.toggle('is-empty', lastParsedState.item_count === 0);
    if (cartDrawerWrapper) cartDrawerWrapper.classList.toggle('is-empty', lastParsedState.item_count === 0);

    if (lastParsedState.item_count === 0 && cartDrawerWrapper.querySelector('.drawer__inner-empty') != null) {
      trapFocus(cartDrawerWrapper.querySelector('.drawer__inner-empty'), cartDrawerWrapper.querySelector('a'))

    } else if (document.querySelector('.cart-item') && cartDrawerWrapper) {
      trapFocus(cartDrawerWrapper, document.querySelector('.cart-item__name'))
    }

    // third, handle line item response and prepare alert text
    const alertObj = {
      "update_delivery_date": false,
      "delete_expired_item": false,
      "deleted_items": []
    };
    responses.forEach((res, index) => {
      const old_line_item_key = line_item_keys[index];
      const body = bodies[index]
      const updateType = body.updateType;

      // type is update delivery_date
      if(updateType){
        this.updateLiveRegionsDeliveryDate(old_line_item_key, body);
        alertObj.update_delivery_date = true;

      // type is delete expired item
      }else{
        alertObj.delete_expired_item = true;
        alertObj.deleted_items.push(body.oldItemTitle);
      }
    })

    // lastly, show warning or error below cart header
    let html = "";
    const hasChange = Object.values(alertObj).includes(true);
    if(hasChange){
      const errors = document.querySelector('#cart-errors > .cart-error__contents')
        || document.querySelector('#CartDrawer-CartErrors > .cart-drawer-error__contents');
      if(alertObj.update_delivery_date == true)
        html += `<p>${window.cartStrings.deliveryDateChanged}</p>`;

      if(alertObj.delete_expired_item == true){
        const suffixmsg = window.cartStrings.deliveryDateChangedLineItemSuffix;
        html += "<p>" + alertObj.deleted_items.join(`${suffixmsg}</p><p>`) + suffixmsg + "</p>";
      }
      console.log("html: ", html);
      errors.innerHTML = html;
      errors.parentNode.classList.remove("hide");
    }
    this.disableLoading();

    return hasChange;
  }
}

customElements.define('cart-items', CartItems);

if (!customElements.get('cart-note')) {
  customElements.define('cart-note', class CartNote extends HTMLElement {
    constructor() {
      super();

      this.addEventListener('change', debounce((event) => {
        const body = JSON.stringify({ note: event.target.value });
        fetch(`${routes.cart_update_url}`, { ...fetchConfig(), ...{ body } });
      }, 300))
    }
  });
};
