FROM php:8.4-cli

# 1. Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libpq-dev \
    librabbitmq-dev \
    && rm -rf /var/lib/apt/lists/*

# 2. Install PHP extensions
# pdo_pgsql: for Database
# amqp: for RabbitMQ
RUN docker-php-ext-install pdo pdo_pgsql \
    && pecl install amqp \
    && docker-php-ext-enable amqp

# 3. Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 4. Set working directory
WORKDIR /app

# 5. Allow Composer to run as root
ENV COMPOSER_ALLOW_SUPERUSER=1

# 6. Copy files and install dependencies
COPY composer.json composer.lock ./
RUN composer install --no-scripts --no-autoloader

# Copy the rest of the app
COPY . .

# Finish composer
RUN composer dump-autoload --optimize

# 7. Expose port 8000
EXPOSE 8000

# Default command (can be overridden in docker-compose)
CMD ["php", "-S", "0.0.0.0:8000", "-t", "public"]
