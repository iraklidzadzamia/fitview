# Widget Integration Guide

This guide explains how a store integrates the FitView widget into a product page.

## 1. Prerequisites

- Active FitView store account.
- Generated API key (`fv_live_...`) from dashboard integration settings.
- Store domain added to `allowedOrigins` in FitView (exact origin match).
- Product page element with `data-fitview-item="<catalog_item_id>"`.

## 2. Add the widget script

Add this script once (usually in `<head>` or before `</body>`):

```html
<script
  src="https://cdn.fitview.ai/widget.js"
  data-api-key="fv_live_your_key"
  data-api-base="https://app.fitview.ai/api/public"
  data-button-text="Try it on"
  data-button-color="#2563eb"
  async
></script>
```

## 3. Mark the product item on the page

Place this near product actions:

```html
<button data-fitview-item="item_123">Try it on</button>
```

The `data-fitview-item` value must match the `CatalogItem.id` in FitView.

## 4. Runtime flow

1. Shopper opens widget and uploads photo.
2. Widget calls `POST /api/public/tryon`.
3. Widget polls `GET /api/public/tryon/:id`.
4. Widget respects `Retry-After` response header for polling interval.
5. On completion, shopper sees and can download the result image.

## 5. Troubleshooting

- `401 Invalid API key`: wrong key or key was rotated.
- `403 Origin not allowed`: request origin not present in store `allowedOrigins`.
- `429 Monthly try-on limit reached`: plan quota reached.
- `429 Rate limit exceeded`: too many requests from same `storeId + ip` key.
