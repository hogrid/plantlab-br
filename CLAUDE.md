# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Shopify Liquid theme called "Tema Base - Hogrid" (v1.2.0) for plantlab-br, an e-commerce site. The theme is built using Shopify's Liquid templating language with extensive customization for Brazilian Portuguese localization.

## Development Commands

This is a Shopify theme project that uses the Shopify CLI for development:

```bash
# Start development server
shopify theme dev

# Deploy theme to store
shopify theme push

# Pull theme from store
shopify theme pull

# Check theme for errors
shopify theme check
```

## Architecture Overview

### Directory Structure
- `layout/` - Base theme layout files (theme.liquid, password.liquid)
- `templates/` - Page templates with JSON/Liquid files for different page types
- `sections/` - Reusable content sections that can be added to pages
- `snippets/` - Reusable code snippets included in other templates
- `assets/` - CSS, JavaScript, images, and other static assets
- `locales/` - Translation files for internationalization (extensive multilingual support)
- `config/` - Theme configuration and settings schema
- `.shopify/` - Shopify CLI configuration and metafields definitions

### Key Features
- **Multilingual Support**: Extensive localization with files for 20+ languages including Portuguese, English, Spanish, German, etc.
- **Custom Metafields**: Product metafields for nutrition tables, content, videos, and custom product information
- **Modular Sections**: Rich set of sections including sliders, blog posts, product listings, and promotional banners
- **Brazilian E-commerce Focus**: Specialized for Brazilian market with Portuguese localization

### Template Structure
- Templates use JSON configuration files paired with Liquid files
- Collection templates support various layouts (masonry, list, full-width)
- Blog templates with multiple view options
- Product templates with custom metafield integration
- AJAX-enabled cart and product interactions

### Liquid Patterns
- Extensive use of Liquid conditionals for RTL language support
- Snippet-based architecture for code reusability
- Settings-driven customization through `settings_schema.json`
- Translation-ready with `t:` prefixed strings referencing locale files

### Development Notes
- Theme uses RTL (Right-to-Left) support with ISO code detection
- Custom metafields are heavily utilized for product customization
- Sections are modular and can be rearranged through the Shopify theme editor
- Snippets follow a component-based approach for maintainability

### Important Files
- `layout/theme.liquid` - Main theme layout with head/body structure
- `config/settings_schema.json` - Theme customization options
- `.shopify/metafields.json` - Custom metafield definitions for products
- Portuguese is the primary language with extensive localization support