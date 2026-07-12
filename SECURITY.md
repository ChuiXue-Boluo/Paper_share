# Security Policy

PaperShare is intended for small-team and local deployments. It does not yet include a production authentication or authorization model.

## Reporting

Please open a private security advisory or contact the maintainers directly if you find a vulnerability.

## Sensitive Data

Never publish runtime data from:

- `server/data/`
- `server/uploads/`
- `.env`

These paths can contain private papers, notes, uploaded images, local paths, and deployment settings.
