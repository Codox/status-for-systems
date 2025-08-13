#!/bin/sh
set -e

# Generate config.json from environment variables
cat <<EOF > /usr/share/nginx/html/config.json
{
  "apiUrl": "${WEB_API_URL}",
  "siteTitle": "${WEB_SITE_TITLE}"
}
EOF

echo "Generated /usr/share/nginx/html/config.json:"
cat /usr/share/nginx/html/config.json

exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf