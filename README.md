# Custom Dawn Pre-Order

[日本語 / Japanese](README_jp.md)

<br>

A customized Shopify theme based on Dawn with popular sales periods and pre-order features added.

Original Dawn -> [Dawn](https://github.com/Shopify/dawn)

[Demo Store](#demo-store) |
[Notes](#notes) |
[Design](#design) |
[Custom Features of this theme](#custom-features-of-this-theme) |
[Setup](#setup) |
[Bug report](#bug-report) |
[License](#license)

<br>

## Demo Store

[Demo](https://custom-dawn-pre-order.myshopify.com/) (Password: yowtwi)

<br>

## Notes

### About locale settings

This theme was developed for Japanese merchants, so locale files other than ja and en and schema files are Dawn's default settings.

If you want to use this theme in other languages, please edit it yourself based on en.default.json.

### About line item properties

This theme uses [line item property](https://shopify.dev/themes/architecture/templates/product#line-item-properties).

In order to prevent the same variation with different estimated delivery dates from existing in the cart more than once, we have added a check when adding to the cart, so other apps that use the line item property may behave strangely.

Specifically, in apps that allow you to customize products with text, etc., you can add multiple variations of the same variation to the cart, but such apps will not work properly if you use this theme.

<br>

## Custom Features of this theme

This theme incorporates two features at the theme level that are not found in the default Shopify.

* [1. Sales period setting (end date only)](#1-Sales-period-setting)
* [2. Pre-order and delivery date setting](#2-Pre-order)

### 1. Sales period setting

The sales period setting is a function that prevents purchase after the sales end date set for each product has passed.

By setting a value in the product's metafield "active_date_end" in the Shopify admin screen, the sales period will be automatically reflected on the product page.

For products whose sales end date has passed, the cart display on the product page will change and the add button will be disabled.

Also, when the sales period for items that the customer has already added to the cart has ended, the items in the cart are validated at a specific time.

This is discussed further below in "Validating Items in the Cart".

<p align="center">
  <img src="https://i.gyazo.com/8a12076443826061f6ceda905afe95d9.png" height=400>
</p>

### 2. Pre-Order and display estimated delivery dates

Pre-order sales is a function that indicates that the product is a reserved product and includes information on the estimated delivery date in the order when the product is shipped by a certain delivery date, such as for made-to-order manufacturing.

By setting the date in the "_delivery_date" of the product's metafield on the Shopify admin screen, the fact that it is a pre-order product and the estimated delivery date will be automatically reflected on the product page.

The estimated delivery date is also displayed on the cart and checkout screens.

<p align="center">
  <img src="https://i.gyazo.com/207ba0783b69118c58862dae2a7e5dac.png" height=350>
  <img src="https://i.gyazo.com/a54fdff9e0ae36b5a729810f4fae2d64.png" height=350>
</p>

After ordering, you can see the value as line_item_property in Manage Orders.

Note that you cannot edit the line_item_property on the Shopify management screen after receiving an order.

Also, it is not possible to filter the orders by the value of the line_item_property.

Shopify's native orders CSV export also does not include line item properties.

From the merchant side, this function is premised on linking with external systems and other applications.

<p align="center">
  <img src="https://i.gyazo.com/ceb0f630e93798deaf5d86e67e2ee46e.png" height=400>
</p>

> **Note**
> At this time, the estimated delivery date is not included in the order when added to cart via the "buy now button"

> **Note**
> There is no function to automatically add the "Pre-Order" tag to orders that include pre-order items.
> Tagging orders requires the use of a custom app or Shopify Flow.
> We may develop custom apps in the future, including the line item property points above.

### About verifying products in the cart

There is one point to consider regarding the sales period and scheduled delivery date features for pre-order sales added in this theme.

Shopify validates inventory availability at checkout.

However, in order for the sales period and estimated delivery date added in this theme to be verified on the checkout page, you will (probably) need to subscribe to the Shopify Plus plan, which gives you permission to edit the checkout.liquid file ( $2000/month at the moment).

This theme was developed for Shopify's cheapest merchants, so we are validating changes in the cart.

Specifically, all products in the cart are verified at the following times.

* when you open the cart drawer
* when you press the checkout button in the cart drawer
* when you open the cart page
* When you press the checkout button on the cart page
* when you press the button to add an item to the cart

You can still purchase invalid items, for example if you enter the checkout link directly in the address bar, but that is not covered in this topic.

<p align="center">
  <img src="https://i.gyazo.com/4fc4f683aa2a504c8027becb2d36b5fd.png" height=400>
  <img src="https://i.gyazo.com/7a4062e4137fb9e41ee6d86db92f179d.png" height=400>
</p>

<br>

## Design

### Home page

The homepage consists mainly of large images.

With minimal effort, you can get your brand across to your customers.

<p align="center">
  <img src="https://i.gyazo.com/4590e3990f0a897c4dfb13eb4457add6.png" width=80%>
</p>

### Product grid and filters

On desktop, you can choose between 3-column and 4-column display.

On mobile, the image is displayed full screen in portrait view.

<p align="center">
  <img src="https://i.gyazo.com/df6ac925d6235f040b015086b0c8a896.gif" height=400>
  <img src="https://i.gyazo.com/41217b10943a5a945efe5cdffc24054f.gif" height=400>
</p>

Pre-order, Pre-order Closed, Sold Out, and Sale badges are displayed.

The filters are designed to be discreet and easy to use.

<p align="center">
  <img src="https://i.gyazo.com/35ed2d4dfdebc3e4ec5f6fdf08c6e20e.gif" width=80%>
</p>

### Product page

The desktop product page uses a two-column view with images on the left and product details on the right.

Product Details behaves like Sticky, but we designed it to be a scrollable section if the height of the description section exceeds the height of the screen.

To keep the product description screen cluttered, measurement information and more detailed descriptions can be mapped to product meta fields for modal description.

Clicking on an image will bring up a slideshow of larger images.

On mobile, it shows an image slider at the top and the product description below.

<p align="center">
  <img src="https://i.gyazo.com/8ee9343feef08a2575c3aff477c6ea5f.gif" height=380>
  <img src="https://i.gyazo.com/b0467147c959c2f47b282d1ccf5e27d5.gif" height=380>
</p>

<br>

## Setup

### Define Metafields

Before using the theme, you should set [Metafields](https://help.shopify.com/ja/manual/metafields) listed below.

#### Product metafield definitions

| Definition name   | Namespace and Key                           | Content type    |
|-------------------|---------------------------------------------|-----------------|
| Limited Pre Order | product.metafields.custom.limited_pre_order | true or false   |
| Active Date End   | product.metafields.custom.active_date_end   | Date            |
| Delivery Date     | product.metafields.custom.delivery_date     | Date            |
| Product Detail    | product.metafields.custom.product_detail    | Milti line text |

<p align="center">
  <img src="https://i.gyazo.com/b37f2964e7e8a8443eccedf389fbfd12.png" width=80%>
</p>

#### Collection metafield definitions

| Definition name   | Namespace and Key                           | Content type     |
|-------------------|---------------------------------------------|------------------|
| About Collection  | collection.metafields.custom.about          | Multiline text   |
| Image Caption Top | collection.metafields.custom.caption_top    | Single line text |

<p align="center">
  <img src="https://i.gyazo.com/59751df478e34980ee5afd983a39708d.png" width=80%>
</p>

<br>

## Bug report

When reporting bugs, please create an issue on the issue tracker.

<br>

## License

Copyright (c) 2021-present Shopify Inc. See [LICENSE](/LICENSE.md) for further details.
