FROM php:8.2-apache

# DocumentRoot -> /public i mod_rewrite
ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf \
    && a2enmod rewrite

# (opcjonalnie) opcache
RUN docker-php-ext-install opcache

WORKDIR /var/www/html
EXPOSE 80
