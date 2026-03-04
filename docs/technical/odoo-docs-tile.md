# Adding the Docs Tile to Odoo

Adds a "Documentation" app tile to the Odoo home screen that opens these docs in a new tab.

## Create the Module

Create `nugget_docs_link` in your custom addons path with 3 files:

### `__manifest__.py`

```python
# -*- coding: utf-8 -*-
# Nugget Docs Link
# Adds a Documentation app tile to the Odoo home screen
{
    'name': 'Nugget Documentation',
    'version': '19.0.1.0.0',
    'category': 'Extra Tools',
    'summary': 'Link to Nugget ERP documentation',
    'author': 'Nugget Scientific',
    'license': 'LGPL-3',
    'depends': ['base'],
    'data': [
        'views/menu.xml',
    ],
    'installable': True,
    'application': True,
}
```

### `__init__.py`

```python
# -*- coding: utf-8 -*-
```

### `views/menu.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <record id="action_open_docs" model="ir.actions.act_url">
        <field name="name">Documentation</field>
        <field name="url">https://noahtheweaver.github.io/nugget-docs/</field>
        <field name="target">new</field>
    </record>

    <menuitem id="menu_docs_root"
              name="Documentation"
              action="action_open_docs"
              web_icon="nugget_docs_link,static/description/icon.png"
              sequence="999"/>
</odoo>
```

## App Icon

Place a 128x128 PNG icon at `static/description/icon.png`. Any icon works — a book, the Nugget logo, etc. Without this file, Odoo will show the default puzzle piece.

## Install

1. Copy the module to your addons path
2. Update the apps list: Settings > Apps > Update Apps List
3. Search for "Nugget Documentation" and install

The tile will appear on the Odoo home screen. Clicking it opens the docs in a new browser tab.
