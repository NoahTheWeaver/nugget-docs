# Dev Environment Setup

Local development environment for Nugget ERP on macOS.

## Prerequisites

- Python 3.10+
- PostgreSQL 17
- Node.js (for docs only)

## Repository Structure

```
odoo-playground/
├── odoo-enterprise/     # Odoo 19 Enterprise source (submodule)
├── Nugget-ERP/          # Custom modules (submodule)
├── nugget-docs/         # This documentation site
├── odoo.conf            # Server configuration
└── venv/                # Python virtual environment
```

## Running the Server

```bash
./venv/bin/python -m odoo -c odoo.conf
```

Server runs at `http://localhost:8069`.

## Running with Module Upgrade

```bash
./venv/bin/python -m odoo -c odoo.conf -u <module_name> --stop-after-init
```

## Database

- **Name:** `odoo_dev`
- **User:** `noahweaver`
- **Host:** `localhost:5432`

## Filestore

macOS location: `~/Library/Application Support/Odoo/filestore/`
