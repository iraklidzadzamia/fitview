# FitView Widget

Embeddable widget bundle used by store frontends.

## Build

```bash
npm run widget:build
```

Output:

- `widget/dist/widget.js`

## Embed

```html
<script
  src="https://cdn.fitview.ai/widget.js"
  data-api-key="fv_live_..."
  data-api-base="https://app.fitview.ai/api/public"
  data-button-text="Try it on"
  data-button-color="#2563eb"
  async
></script>

<button data-fitview-item="item_123">Try it on</button>
```
