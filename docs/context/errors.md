# Error log
Entries go newest first.

## Homepage lists a building that is not marketed (fallback list out of date)
- Cause: the static fallback list in `src/lib/data/properties.ts` disagreed with the live CMS list (an unmarketed building was featured and a current one was missing).
- Fix: keep the fallback matching the live list; removed the stale building and its photo, added the missing one (commit 71b05a8).
- Date: 2026-10-09

## Contact form shows success but the inquiry is never delivered
- Cause: the contact route returned 201 whether or not the email was sent; an unconfigured mailer or an SMTP/render failure was swallowed, and there is no database behind the form.
- Fix: return 503 when email is unconfigured, 502 when render or send fails, 201 only on delivery (commit 4768f1a).
- Date: 2026-08-09
