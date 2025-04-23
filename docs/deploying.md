# Deploying

The schedule viewer is a single page app (SPA), so deploying it is as simple as
copying the files to a web server. However, there are a few steps required to
configure the web server and application.

## Routing Types

Application routes can be handled two ways: by specifying page paths in the URL
hash (after the #, hash routing), or by modifying the path in the URL bar
directly (browser routing). The former is requires no server-side configuration,
but the latter makes for cleaner URLs. Choose one before configuring the
application.

## Application Configuration

1. Edit the configuration files, `config.js` and `config.json`. See the section
   on [configuration](./config.md) for details.
   If the application is not being served from the web root, ensure that
   `scheduleBasePath` is configured appropriately.
2. If the application is not being served from the web root, edit `index.html`
   and update the URLs in the head of the document to include the directory the
   files are in.
3. Customize the `schedule.webmanifest` file to fit your brand.
   See https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest for more information.
4. Replace any images/icons with your organization's.
5. Add any custom CSS rules to `custom.css`.

## Web Server Configuration

1. Configure your web server with a fallback route to serve `index.html` if a
   file in the application's directory is not found.
2. Ensure your web server sends a `Cache-Control: max-age=0` header or
   equivalent for the application's files.
   Files in `css/` or `js/`, or which have a hash in their name may have a long
   cache time.
