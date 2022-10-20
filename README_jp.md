# Custom Dawn Pre-Order

[English](README.md)

<br>

Dawnを元にカスタマイズし、カスタム機能として「販売期間設定」と「予約販売設定」を実現したShopify themeです。

オリジナルDawn -> [Dawn](https://github.com/Shopify/dawn)

[デモストア](#デモストア) |
[留意事項](#留意事項) |
[デザイン](#デザイン) |
[本テーマの独自機能](#本テーマの独自機能) |
[セットアップ](#セットアップ) |
[バグ報告](#バグ報告) |
[ライセンス](#ライセンス)

<br>

## デモストア

[Demo](https://custom-dawn-pre-order.myshopify.com/)（Password: yowtwi）

<br>

## 留意事項

### locale設定について

本テーマは日本のマーチャント向けに開発したものなので、ja, en以外のlocaleファイルとschemaファイルはDawnの初期設定です。

本テーマをその他の言語で利用される場合は、en.default.jsonを元に、ご自身で編集してください。

### line item propertyについて

本テーマでは、[line item property](https://shopify.dev/themes/architecture/templates/product#line-item-properties)を利用しています。

異なる納品予定日の同じバリエーションがカート内に複数存在しないよう、カート追加時にチェックする処理を追加しているため、line item propertyを利用する他のアプリの動作がおかしくなる可能性があります。

具体的には、商品に文字入れ等のカスタマイズを行えるようになるアプリ等では、同じバリエーションを複数カートに追加することが可能ですが、本テーマを利用するとそういったアプリが正常に動作しません。

<br>

## 本テーマの独自機能

本テーマでは、デフォルトのShopifyにはない2つの機能をテーマレベルで組み込んでいます。

* [1. 販売期間設定（終了日のみ）](#1-販売期間設定（終了日のみ）)
* [2. 予約販売と納品予定日の設定](#2-予約販売と納品予定日の設定)

### 1. 販売期間設定（終了日のみ）

販売期間設定は、商品ごとに設定した販売終了日を過ぎると購入ができなくなるという機能です。

Shopifyの管理画面で商品のmetafieldsの"active_date_end"に値を設定することで、販売期間が商品ページに自動的に反映されます。

販売終了日を過ぎた商品は、商品ページのカートの表示が変わり、追加ボタンも無効化されます。

また、顧客がすでにカートに追加した商品の販売期間が終了した場合も、特定のタイミングでカート内の商品の検証を行います。

これについては、下記の"カート内の商品の検証"で詳しく解説します。

<p align="center">
  <img src="https://i.gyazo.com/8a12076443826061f6ceda905afe95d9.png" height=400>
</p>

### 2. 予約販売と納品予定日の設定

予約販売は、受注生産などで一定の納期で商品を発送する場合に、予約商品であることを表示し、オーダーに納品予定日の情報を含む機能です。

Shopifyの管理画面で商品のmetafieldsの"_delivery_date"に日付を設定することで、予約販売の商品であることや納品予定日が商品ページに自動的に反映されます。

納品予定日はカートやチェックアウト画面でも表示されます。

<p align="center">
  <img src="https://i.gyazo.com/207ba0783b69118c58862dae2a7e5dac.png" height=350>
  <img src="https://i.gyazo.com/a54fdff9e0ae36b5a729810f4fae2d64.png" height=350>
</p>

注文後は、オーダーの管理画面でline_item_propertyとして値を確認できます。

なお、受注後にShopifyの管理画面上で、line_item_propertyを編集することはできません。

また、line_item_propertyの値でオーダーをフィルタリングすることもできません。

ShopifyのネイティブのオーダーCSVエクスポートにも、line item propertyは含まれません。

マーチャント側としては、本機能は外部のシステムや他のアプリと連携してすることが前提となります。

<p align="center">
  <img src="https://i.gyazo.com/ceb0f630e93798deaf5d86e67e2ee46e.png" height=400>
</p>

> **Note**  
> 現時点では、「今すぐ購入ボタン」を通してカートに追加した場合は納品予定日がオーダーに含まれません

> **Note**  
> 予約商品を含むオーダーに自動的に"Pre-Order"タグを付与する機能はありません。
> オーダーへのタグの付与には、カスタムアプリやShopify Flowの利用が必要です。
> 上記のline item propertyの点を含め、今後カスタムアプリを開発する可能性があります。


### カート内の商品の検証について

本テーマで追加した販売期間、予約販売の納品予定日の機能に関して、1点考慮すべき点があります。

Shopifyでは、チェックアウト時に在庫が存在するかの検証が行われます。

ただし、本テーマで追加した販売期間、納品予定日について、チェックアウトページでの検証を行うには、（おそらく）checkout.liquidファイルの編集権限が得られるShopify Plusプランへの加入が必要となります（現時点で月額$2000〜）。

本テーマはShopifyの最安プランのマーチャント向けに開発したため、カート内で変更の検証をおこなっております。

具体的に下記のタイミングで、カート内のすべての商品についての検証をおこなっています。

* カートドロワーを開いた時
* カートドロワーのチェックアウトボタンを押した時
* カートページを開いたとき
* カートページのチェックアウトボタンを押した時
* 商品をカートに追加するボタンを押した時

依然として、例えば、直接アドレスバーにcheckoutのリンクを入力した場合などは無効な商品を購入することができてしまいますが、本テーマではそこについては扱いません。

<p align="center">
  <img src="https://i.gyazo.com/4fc4f683aa2a504c8027becb2d36b5fd.png" height=400>
  <img src="https://i.gyazo.com/7a4062e4137fb9e41ee6d86db92f179d.png" height=400>
</p>

<br>

## デザイン

### ホームページ

ホームページは、大きな画像を中心に構成しております。

最小限の労力で、あなたのブランドを顧客に訴求することができます。

<p align="center">
  <img src="https://i.gyazo.com/4590e3990f0a897c4dfb13eb4457add6.png" width=80%>
</p>


### 商品グリッドとフィルタ

デスクトップでは、3列か4列表示かを選択できます。

モバイルでは、画像をポートレート表示で画面一面に表示します。

<p align="center">
  <img src="https://i.gyazo.com/df6ac925d6235f040b015086b0c8a896.gif" height=400>
  <img src="https://i.gyazo.com/41217b10943a5a945efe5cdffc24054f.gif" height=400>
</p>

予約販売、予約終了、売り切れ、セールのバッジが表示されます。

フィルターは、目立たず使いやすいようにデザインされています。

<p align="center">
  <img src="https://i.gyazo.com/35ed2d4dfdebc3e4ec5f6fdf08c6e20e.gif" width=80%>
</p>

### 商品ページ

デスクトップの商品ページは、左に画像、右に商品詳細の2カラムビューを採用しています。

商品詳細は、Stickyのように振る舞いますが、説明セクションの高さが画面の高さを超える場合は、スクロール可能なセクションになるようにデザインしています。

商品の説明画面がごちゃごちゃしないよう、採寸情報やより詳しい解説については、モーダルで説明できるよう、商品メタフィールドと対応させられます。

画像のクリックで、より大きく画像を表示するスライドショーが表示されます。

モバイルでは、上部に画像のスライダーを表示し、下に商品説明が表示されます。

<p align="center">
  <img src="https://i.gyazo.com/8ee9343feef08a2575c3aff477c6ea5f.gif" height=380>
  <img src="https://i.gyazo.com/b0467147c959c2f47b282d1ccf5e27d5.gif" height=380>
</p>

<br>

## セットアップ

### メタフィールド

テーマの利用前に、下記の[メタフィールド](https://help.shopify.com/ja/manual/metafields)をショップに設定してください。

#### 商品メタフィールド

| 定義名           | ネームスペースとキー                        | コンテンツタイプ |
|------------------|---------------------------------------------|------------------|
| 数量限定予約商品 | product.metafields.custom.limited_pre_order | true or false    |
| 予約終了日       | product.metafields.custom.active_date_end   | Date             |
| 納品予定日       | product.metafields.custom.delivery_date     | Date             |
| 商品詳細         | product.metafields.custom.product_detail    | Milti line text  |

<p align="center">
  <img src="https://i.gyazo.com/97efbeb4698fbfe3bde4991003eb1b7c.png" width=80%>
</p>

#### コレクションメタフィールド

| 定義名           | ネームスペースとキー                        | コンテンツタイプ |
|-----------------|---------------------------------------------|------------------|
| コレクション説明  | collection.metafields.custom.about          | Multiline text   |
| 画像上の説明     | collection.metafields.custom.caption_top    | Single line text |

<p align="center">
  <img src="https://i.gyazo.com/058069d87c41a99ac20b7f7736200c64.png" width=80%>
</p>


## バグ報告

バグ報告の際は、イシュートラッカー にイシューを作成して頂きますようお願い致します。

<br>

## ライセンス

Copyright (c) 2021-present Shopify Inc. See [LICENSE](/LICENSE.md) for further details.
