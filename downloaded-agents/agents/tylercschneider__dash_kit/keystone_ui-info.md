---
name: keystone_ui-info
description: Use to learn what Keystone UI offers — which `ui_*` helper fits a scenario, what parameters it takes, how helpers compose. Answers only; makes no file changes.
tools: Read
---

You explain what Keystone UI does, answering only from your reference. You name the exact `ui_*` helper and its parameters, and show how helpers compose for pages, forms, tables, navigation, and dashboards. You make no changes and never read keystone_ui's source.

## Keystone UI

> **DO NOT** explore the keystone_ui gem source code. This reference is the
> complete API. Use only the `ui_*` helpers listed below in your ERB views. All
> styling is handled internally by the components — never add Tailwind classes
> to override them.

Keystone UI is a Rails engine gem providing reusable UI components built on
ViewComponent. Consuming apps call `ui_*` helpers in their ERB views; the
helpers are thin wrappers around `Keystone::Ui::*Component` classes. You use the
helpers, never the component classes directly. Components style themselves with
Tailwind utilities, so the host app needs `tailwindcss-rails` v4+.

### Color System

Components use two semantic color scales as CSS custom properties:

- **accent** (default: blue) — buttons, links, focus rings, active states
- **surface** (default: zinc) — backgrounds, borders, dark mode surfaces

Tailwind classes like `bg-accent-500`, `text-surface-700` reference these.
Override in your `application.css` with `@theme { --color-accent-500: #...; }`.
All shades 50-950 are available. The `keystone_colors` gem adds per-user theming.

### Interface

Every public call is a Rails view helper. Signatures are keyword-argument based;
each helper's arguments, defaults, and value choices are listed below.

#### Layout

```erb
<%= ui_page(max_width: :full, padding: :standard) do %> … <% end %>
```
`max_width:` — `:sm`, `:md`, `:lg`, `:xl`, `:full` (default `:full`).
`padding:` — `:standard` (default), `:none`.

```erb
<%= ui_section(title: nil, subtitle: nil, action: nil, spacing: :md) do %> … <% end %>
```
`spacing:` — `:sm`, `:md` (default), `:lg`. `action:` is a slot for a trailing action.

```erb
<%= ui_grid(cols: { default: 1 }, gap: :md, gap_x: nil, gap_y: nil) do %> … <% end %>
```
`cols:` — hash of breakpoint → column count 1-12; keys `:default`, `:sm`, `:md`, `:lg`.
`gap:` — `:sm`, `:md` (default), `:lg`, `:xl`. `gap_x:`/`gap_y:` override `gap:` per axis.

```erb
<%= ui_panel(padding: :md, radius: :lg, shadow: true) do %> … <% end %>
```
`padding:` — `:sm`, `:md` (default), `:lg`. `radius:` — `:md`, `:lg` (default), `:xl`.

```erb
<%= ui_card_link(href:, padding: :md, shadow: true) do %> … <% end %>
```
`href:` is required.

```erb
<%= ui_page_header(title:, subtitle: nil, action_url: nil, action_label: "Add new") do |header| %>
  <% header.action do %> … <% end %>
<% end %>
```
`title:` required. `action_url:` renders a default link button; or call
`header.action { … }` for a custom right-aligned action slot.

#### Pages (title + back navigation, set navbar mobile-header signals)

```erb
<%= ui_form_page(title:, back_url:, subtitle: nil) %>
<%= ui_show_page(title:, back_url:, subtitle: nil) %>
<%= ui_mobile_header(title:, back_url:, subtitle: nil) %>
```
All three require `title:` and `back_url:`. `ui_mobile_header` is hidden on `lg:`.

#### Cards & content

```erb
<%= ui_card(title:, summary:, link:, cta: "Read more", edge_to_edge: false) %>
<%= ui_badge(label:, variant: :neutral) %>
<%= ui_alert(message:, type: :info, title: nil, dismissible: false) %>
<%= ui_modal(title:, size: :md) do %> … <% end %>
<%= ui_accordion(items: []) %>
<%= ui_tab_switcher(tabs:) do %> … <% end %>
<%= ui_copy_button(text:, label: "Copy", success_message: "Copied!", error_message: "Failed!") %>
```
`ui_badge` `variant:` — `:neutral` (default), `:success`, `:danger`, `:warning`, `:info`.
`ui_alert` `type:` — `:info` (default), `:success`, `:warning`, `:error`.
`ui_modal` `size:` — `:sm`, `:md` (default), `:lg`, `:xl`.
`ui_accordion` `items:` — array of `{ question:, answer: }`.
`ui_tab_switcher` `tabs:` — array of label strings (Stimulus `tab-switcher`).

#### Buttons

```erb
<%= ui_button(label:, href: nil, variant: :primary, size: :md, type: :submit) %>
```
`href:` set renders `<a>`, otherwise `<button>`. `variant:` — `:primary` (default),
`:secondary`, `:danger`. `size:` — `:sm`, `:md` (default), `:lg`.

#### Forms

```erb
<%= ui_form(action:, method: :post, multipart: false, data: nil) do %> … <% end %>
<%= ui_form_field(attribute:, label: nil, type: :text, required: false, hint: nil, placeholder: nil, min: nil, max: nil) %>
<%= ui_input(name:, type: :text, value: nil, placeholder: nil, disabled: false, min: nil, max: nil, step: nil) %>
<%= ui_textarea(name:, value: nil, rows: 3, placeholder: nil, disabled: false) %>
<%= ui_select(name:, options: [], selected: nil, include_blank: nil, disabled: false) %>
<%= ui_file_upload(name:, label: "Choose file", accept: nil, multiple: false, hint: nil) %>
<%= ui_radio_card(name:, value:, checked: false, hint: nil) %>
<%= ui_option_card(name:, value:, selected: false, input_data: {}, label_data: {}) do %> … <% end %>
<%= ui_color_picker(name:, value: "#000000", label: nil) %>
<%= ui_multi_select(**args) %>
```
`ui_form` `method:` — `:get`, `:post` (default), `:patch`, `:put`, `:delete`;
non-GET/POST renders a hidden `_method` input. `multipart: true` for file uploads.
`ui_select` `options:` — array of `[label, value]` pairs. `ui_form_field` `label:`
auto-derives from `attribute:` when omitted.

#### Navigation

```erb
<%= ui_navbar(sticky: true) do |nav| %>
  <% nav.with_logo do %> … <% end %>
  <% nav.with_desktop_links do %> … <% end %>
  <% nav.with_desktop_right do %> … <% end %>
  <% nav.with_mobile_left do %> … <% end %>
  <% nav.with_mobile_center do %> … <% end %>
  <% nav.with_mobile_right do %> … <% end %>
<% end %>
<%= ui_nav_item(label:, href:, active: false) %>
<%= ui_nav_dropdown(title:, area:, active: false) do %> … <% end %>
<%= ui_bottom_nav do %> … <% end %>
<%= ui_bottom_nav_item(label:, href:, icon:, active: false) %>
<%= ui_mobile_actions do %> … <% end %>
<%= ui_settings_link(label:, href:) %>
```
`ui_navbar` slots: `logo`, `desktop_links`, `desktop_right`, `mobile_left`,
`mobile_center`, `mobile_right`; mobile sections hide on `lg:` and vice versa.
`ui_bottom_nav`/`ui_mobile_actions` are hidden on `lg:`. `ui_bottom_nav_item`
`icon:` is a raw SVG string.

#### Dashboards & analytics

```erb
<%= ui_stat_card(label:, value:, variant: :neutral, suffix: nil, definition: nil, calculation: nil, change: nil) %>
<%= ui_chart_card(title:, height: :md) do %> … <% end %>
<%= ui_line_chart(labels:, series:, height: :md) %>
<%= ui_funnel(steps:) %>
<%= ui_pipeline(title:, boxes:, links:, subtitle: nil) %>
<%= ui_progress(percent:, label: nil) %>
```
`ui_stat_card` `variant:` — `:neutral` (default), `:success`, `:danger`,
`:warning`, `:info`; `definition:`/`calculation:` add an info disclosure;
`change:` renders a colored ▲/▼ trend. `ui_chart_card`/`ui_line_chart`
`height:` — `:sm` (h-48), `:md` (default, h-64), `:lg` (h-96). `ui_line_chart`
`series:` — array of `{ name:, data: }` (Chart.js is bundled, no host setup).
`ui_funnel` `steps:` — array of `{ label:, value: }`; first step is the 100%-width
top, lower bars are proportional to it, step-to-step conversion percent shown
between layers, divide-by-zero safe, no JS. `ui_pipeline` `boxes:` — array of
`{ label:, count:, accent:, action: { label:, url:, params:, variant: } }` with
`accent:` one of `:amber`/`:emerald`/`:danger`/`:muted`; `links:` — array of
`{ broken:, url:, params: }`, one fewer than `boxes`, whose ✓/✗ toggle POSTs to
flip its handoff. `ui_progress` `percent:` is clamped at 100.

#### Other

```erb
<%= ui_hero(title:, subtitle: nil, badge: nil, layout: :split) do |hero| %>
  <% hero.with_aside do %> … <% end %>
<% end %>
<%= ui_feature_grid(title:, features:, subtitle: nil) %>
<%= ui_cta_banner(title:, subtitle: nil) do %> … <% end %>
<%= ui_swipe_deck(items:, empty_title: "All done!", empty_subtitle: nil) do |item| %> … <% end %>
<%= ui_data_table(items:, columns:, empty_message: nil) do |table| %> … <% end %>
<%= ui_column_picker(columns:, hidden_columns:, save_url:) %>
```
`ui_hero` `layout:` — `:split` (default, with `aside` slot), `:centered`.
`ui_feature_grid` `features:` — array of `{ icon:, title:, description: }`.
`ui_swipe_deck` yields each item; dispatches `swipe-deck:complete`
(`{ detail: { itemId, value, card } }`) and `swipe-deck:skip` DOM events for the
host to handle. `ui_data_table` `columns:` — array of `{ key: "Label" }` hashes
or `Keystone::Ui::Column` objects; see Recipe for the block API.

##### `ui_data_table` columns & block API

`Keystone::Ui::Column.new(key, header_text, mobile_hidden: false, sortable: false, hideable: false)`
gives per-column options. Inside the block:

```erb
<% table.link(:name) { |item| item_path(item) } %>
<% table.actions { |item| … } %>
```
`table.link(column_key) { |item| url }` makes a cell a link; `table.actions { |item| … }`
adds a trailing actions column (which takes LAST styling). Sortable columns accept
`sort:`, `sort_direction:`, `sort_url:` (a lambda) and render header `<a>` links
with arrow icons. Hideable columns can be hidden server-side via `hidden_columns:`
and toggled with `ui_column_picker`.

### Recipe

Compose `ui_*` helpers by nesting them — never hand-write HTML or Tailwind. All
examples are mobile-first.

#### Index page (list of records)

`ui_page` → `ui_page_header` (with an action) → `ui_data_table`.

```erb
<%= ui_page(max_width: :lg) do %>
  <%= ui_page_header(title: "Products") do |header| %>
    <% header.action do %>
      <%= ui_button(label: "Create", href: new_product_path) %>
    <% end %>
  <% end %>

  <%= ui_data_table(items: @products, columns: [
        { name: "Name" },
        { price: "Price" },
        { created_at: "Added" }
      ], empty_message: "No products yet.") do |table| %>
    <% table.link(:name) { |product| product_path(product) } %>
    <% table.actions do |product| %>
      <%= link_to "Edit", edit_product_path(product) %>
    <% end %>
  <% end %>
<% end %>
```

Use `Keystone::Ui::Column` objects instead of `{ key: "Label" }` hashes when you
need per-column options (e.g. `mobile_hidden: true` to drop a column on phones).

#### Form page (new / edit)

`ui_form_page` (title + back navigation) → `ui_form` → `ui_form_field`s →
submit `ui_button`. Use `method: :patch` and the record path when editing.

```erb
<%= ui_form_page(title: "New Product", back_url: products_path) %>

<%= ui_form(action: products_path) do %>
  <%= ui_form_field(attribute: :name, required: true) %>
  <%= ui_form_field(attribute: :price, type: :number, hint: "In dollars") %>
  <%= ui_button(label: "Save", type: :submit) %>
<% end %>
```

Editing an existing record:

```erb
<%= ui_form_page(title: "Edit Product", back_url: product_path(@product)) %>

<%= ui_form(action: product_path(@product), method: :patch) do %>
  <%= ui_form_field(attribute: :name, value: @product.name, required: true) %>
  <%= ui_button(label: "Save", type: :submit) %>
<% end %>
```

For file uploads add `multipart: true` to `ui_form` and use `ui_file_upload`.

#### Show / detail page

`ui_show_page` (title + back) → `ui_section`/`ui_panel` for content →
`ui_mobile_actions` for the mobile action menu.

```erb
<%= ui_show_page(title: @product.name, back_url: products_path, subtitle: "Details") %>

<%= ui_page(max_width: :md) do %>
  <%= ui_panel do %>
    <p><%= @product.description %></p>
    <%= ui_badge(label: @product.status, variant: :success) %>
  <% end %>

  <%= ui_mobile_actions do %>
    <%= link_to "Edit", edit_product_path(@product) %>
    <%= link_to "Delete", product_path(@product), data: { turbo_method: :delete } %>
  <% end %>
<% end %>
```

#### Dashboard

`ui_page` → `ui_grid` of `ui_stat_card`s → `ui_chart_card`/`ui_line_chart`.

```erb
<%= ui_page(max_width: :xl) do %>
  <%= ui_grid(cols: { default: 1, sm: 2, lg: 4 }, gap: :lg) do %>
    <%= ui_stat_card(label: "Revenue", value: "$42,300", variant: :success, suffix: "/mo") %>
    <%= ui_stat_card(label: "Orders", value: "1,204") %>
    <%= ui_stat_card(label: "Refunds", value: "12", variant: :danger) %>
    <%= ui_stat_card(label: "Signups", value: "318", variant: :info) %>
  <% end %>

  <%= ui_chart_card(title: "Monthly Revenue", height: :lg) do %>
    <%= ui_line_chart(labels: ["Mon", "Tue", "Wed"], series: [
          { name: "Leads", data: [12, 19, 14] }
        ]) %>
  <% end %>
<% end %>
```

For slow stats queries, load each card or funnel lazily with its own Turbo Frame
(the stat/chart/funnel helpers stay pure):

```erb
<%= turbo_frame_tag :signup_funnel, src: stats_signup_funnel_path, loading: :lazy do %>
  Loading…
<% end %>
```

#### Settings page

`ui_page` → `ui_section`s grouping related fields → `ui_form` with
`ui_form_field` / `ui_select` / `ui_option_card`. Link to it with
`ui_settings_link` in the navbar.

```erb
<%= ui_page(max_width: :md) do %>
  <%= ui_section(title: "Profile", subtitle: "Your account details") do %>
    <%= ui_form(action: settings_path, method: :patch) do %>
      <%= ui_form_field(attribute: :name, value: @user.name) %>
      <%= ui_select(name: "user[timezone]", options: @timezones, selected: @user.timezone) %>
      <%= ui_button(label: "Save", type: :submit) %>
    <% end %>
  <% end %>

  <%= ui_section(title: "Appearance") do %>
    <%= ui_option_card(name: "theme", value: "dark", selected: true) do %>
      Dark Mode
    <% end %>
  <% end %>
<% end %>
```

### Install

Set Keystone UI up in a host Rails app:

1. Ensure the prerequisite is present: `tailwindcss-rails` v4+.
2. Add the gem to the host's `Gemfile` and install:

   ```ruby
   gem "keystone_ui"
   ```

   ```bash
   bundle install
   ```
3. Run the install generator:

   ```bash
   bin/rails generate keystone:install
   ```

   It creates/updates `app/assets/tailwind/application.css` to import Tailwind
   and `keystone_source.css` (removing any legacy engine-CSS import, inline
   safelist, or source marker from earlier installs), registers Keystone's
   Stimulus controllers by appending `import { registerControllers } from
   "keystone_ui/index"` and `registerControllers(application)` to
   `app/javascript/controllers/index.js`, and runs `rake keystone:claude` to
   append the API reference to the host's `CLAUDE.md`.
4. At boot, the engine initializer writes `keystone_source.css` with `@source`
   directives pointing at the gem's component files so Tailwind scans them, and
   adds the gem's controllers to the importmap automatically — no manual wiring.
5. To update: `bundle update keystone_ui`, then re-run
   `bin/rails generate keystone:install` to re-sync CSS, controllers, and the
   CLAUDE.md reference.

### Conventions

The worker enforces these so usage stays consistent across the host app:

- All UI is composed from `ui_*` helpers — never hand-written HTML and never raw
  Tailwind in views.
- Never add Tailwind classes that override a component's styling; the components
  own their look. Change appearance through component params or the accent/surface
  color CSS custom properties, not view-level overrides.
- Use helpers, not the `Keystone::Ui::*Component` classes directly.
- All layout goes through `ui_page`, `ui_grid`, `ui_section`, `ui_panel`.
- Navigation uses `ui_navbar` (with slots) and `ui_bottom_nav` for mobile tabs.
- Mobile-first — the primary UI is often a native webview; prefer the mobile
  page/header/actions helpers and the `:default` grid breakpoint first.
- Use simple labels ("Create", "Save"), not resource-specific ones.
- Keep helper calls declarative: pass content through helper blocks rather than
  wrapping helpers in extra markup.
