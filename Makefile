ARGS = $(filter-out $@,$(MAKECMDGOALS))

DOCKER ?= docker
DOCKER_COMPOSE ?= $(DOCKER) compose

DOCKER_EXEC ?= $(DOCKER_COMPOSE) exec
DOCKER_RUN ?= $(DOCKER_COMPOSE) run --rm

PHP ?= $(DOCKER_EXEC) php php

SYMFONY_ENV ?= dev
SYMFONY_CONSOLE ?= $(PHP) bin/console

COMPOSER ?= $(DOCKER_EXEC) php composer

YARN ?= $(DOCKER_RUN) nodejs yarn

MAKE ?= make

##
##Project =============================================================================================================
##

.DEFAULT_GOAL := help
.PHONY: install install_app version uninstall start stop

install: ## Installs the docker and the application
install: docker_install install_app assets_install

start: ## Compose Image docker
	$(DOCKER_COMPOSE) up -d
	$(MAKE) supervisor
	$(MAKE) up-display

stop: ## Compose Image docker
	$(DOCKER_COMPOSE) down --remove-orphans
	$(MAKE) down-display

install_app: ## Installs the application (vendors, assets, database)
install_app: composer_install database version

version: ## Displays Symfony version
	$(SYMFONY_CONSOLE) --version

uninstall: ## Uninstall application
uninstall: docker_network_rm
	$(DOCKER_COMPOSE) down -v

##
##Database ============================================================================================================
##

.PHONY: database_create database sf_diff sf_make_migration sf_migrate sf_fixtures sf_fixtures_load database_test

database: ## Initializes the database (schema, migrations, fixtures, index)
database: database_create sf_migrate sf_fixtures_load

database_create: ## Initialize the database
	$(SYMFONY_CONSOLE) doctrine:database:drop --if-exists --force --env=$(SYMFONY_ENV)
	$(SYMFONY_CONSOLE) doctrine:database:create --if-not-exists --env=$(SYMFONY_ENV)

sf_diff: ## Show new migration
	$(SYMFONY_CONSOLE) doctrine:migrations:diff

sf_make_migration: ## Generates a new migration
	$(SYMFONY_CONSOLE) make:migration --formatted

sf_migrate: ## Execute doctrine migrations
	$(SYMFONY_CONSOLE) doctrine:migrations:migrate -n --env=$(SYMFONY_ENV) --allow-no-migration

sf_fixtures_load:  ## Load initial fixtures
	$(SYMFONY_CONSOLE) hautelook:fixtures:load --append --env=$(SYMFONY_ENV)

sf_fixtures: ## Load custom fixtures
	$(SYMFONY_CONSOLE) hautelook:fixtures:load $(ARGS)

database_test: ## Initialize the test database
	make database_create SYMFONY_ENV=test
	make sf_migrate SYMFONY_ENV=test
	make sf_fixtures_load SYMFONY_ENV=test

##
##Back-end assets =====================================================================================================
##

.PHONY: assets_install yarn_install yarn_upgrade yarn_audit

assets_install: ## Install assets
	$(SYMFONY_CONSOLE) assets:install

yarn_install: ## Installs node dependencies
	$(YARN) install
	$(DOCKER_RUN) nodejs npm rebuild node-sass

yarn_upgrade: ## Refresh yarn.lock
yarn_upgrade: yarn_install
	$(YARN) upgrade

yarn_audit: ## Runs Yarn in audit mode
yarn_audit: yarn_install
	$(YARN) audit

##
##Docker ==============================================================================================================
##

.PHONY: docker_build docker_rebuild docker_install docker_network_rm docker_network_create docker_bash

docker_build: ## docker build container
	$(DOCKER_COMPOSE) build --pull

docker_rebuild: ## docker rebuild container
	$(DOCKER_COMPOSE) build

docker_network_rm: ## docker network delete
	$(DOCKER) network rm page_builder || true

docker_network_create: ## docker network creation
docker_network_create: docker_network_rm
	$(DOCKER) network create page_builder || true

docker_install: ## Install docker
docker_install: docker_network_create docker_build start

docker_bash: ##Get into App docker bash.
docker_bash:
	$(DOCKER_EXEC) php sh

##
##Composer ============================================================================================================
##

.PHONY: composer_install composer_update composer_require composer_remove composer_why composer_why_not composer_outdated composer_audit

composer_install: app/composer.lock ## Install composer dependencies
	$(COMPOSER) install --optimize-autoloader --no-scripts

composer_update: app/composer.json ## Update composer dependencies
	$(COMPOSER) update --no-scripts

composer_require: app/composer.json ## Require composer dependency
	$(COMPOSER) require ${ARGS}

composer_remove: app/composer.json ## Remove composer dependency
	$(COMPOSER) remove ${ARGS}

composer_why: app/composer.json ## Why composer dependency
	$(COMPOSER) why ${ARGS}

composer_why_not: app/composer.json ## Why not composer dependency
	$(COMPOSER) why_not ${ARGS}

composer_outdated: app/composer.json ## Get the list of outdated Composer packages
	$(COMPOSER) outdated

composer_audit: app/composer.json ## Check vulnerable packages
	$(COMPOSER) audit

##
##Tests ===============================================================================================================
##

.PHONY: phpunit php-cs-fixer var-dump-checker phpstan behat inspector

phpunit: ## Run Unit tests
	$(PHP) bin/console asset-map:compile -q --env=test
	$(PHP) bin/console asset-map:compile -q --env=test
	$(PHP) bin/console doctrine:database:drop -q --if-exists --force --env=test
	$(PHP) bin/console doctrine:database:create -q --if-not-exists --env=test
	$(PHP) bin/console doctrine:schema:create -q --env=test
	$(PHP) bin/console hautelook:fixtures:load -q --env=test
	$(PHP) bin/phpunit -d memory_limit=-1
	$(DOCKER_EXEC) php rm -rf public/assets
	$(PHP) bin/console  doctrine:database:drop --if-exists --force --env=test

phpstan: ## Run PHPStan fixer
	$(PHP) vendor/bin/phpstan analyze -c phpstan.dist.neon --memory-limit 1G

var-dump-checker: ## Run var-dump detection
	$(PHP) vendor/bin/var-dump-check --symfony src

behat: ## Run Behat
	$(PHP) bin/console asset-map:compile -q --env=test
	$(PHP) bin/console doctrine:database:drop -q --if-exists --force --env=test
	$(PHP) bin/console doctrine:database:create -q --if-not-exists --env=test
	$(PHP) bin/console doctrine:schema:create -q --env=test
	$(PHP) bin/console hautelook:fixtures:load -q --env=test
	$(PHP) vendor/bin/behat
	$(DOCKER_EXEC) php rm -rf public/assets
	$(PHP) bin/console  doctrine:database:drop --if-exists --force --env=test

php-cs-fixer: ## Run PHP-CS-Fixer
	$(PHP) vendor/bin/php-cs-fixer fix src

inspector: ## Run quality, security and tests
inspector: php-cs-fixer phpstan var-dump-checker php-cs-fixer sf_cc_test database_test phpunit behat

##
##Utils ===============================================================================================================
##

.PHONY: help sf_console sf_cc doctrine_cc sf_cc_test supervisor

sf_console: ## symfony console
	$(SYMFONY_CONSOLE) ${ARGS}

sf_cc: ## clear dev cache environment
	$(SYMFONY_CONSOLE) cache:clear

sf_cc_test: ## clear test cache environment
	$(SYMFONY_CONSOLE) cache:clear --env=test

doctrine_cc: ## clear doctrine caches
	$(SYMFONY_CONSOLE) doctrine:cache:clear-query \
	&& $(SYMFONY_CONSOLE) doctrine:cache:clear-result \
	&& $(SYMFONY_CONSOLE) doctrine:cache:clear-metadata

supervisor: ## Start supervisord
	$(DOCKER_EXEC) php /etc/init.d/supervisor start

help:
	@grep -E '(^[a-zA-Z_-]+:.*?##.*$$)|(^##)' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[32m%-30s\033[0m %s\n", $$1, $$2}' | sed -e 's/\[32m##/[33m/'

# Ci commands ==========================================================================================================

.PHONY: ci_install_template ci_behat ci_phpstan ci_security ci_ecs ci_phpunit

ci_install_template:
	export APP_ENV=$(SYMFONY_ENV) && echo $(APP_ENV)
	cd app \
	&& composer install --no-progress -o \
	&& composer dump-env $(SYMFONY_ENV) \
	&& yarn install

ci_behat:
	cd app \
	&& php bin/console importmap:install \
	&& php bin/console asset-map:compile -q \
	&& php bin/console doctrine:database:create -q --env=test \
	&& php bin/console doctrine:schema:create -q --env=test \
	&& php bin/console hautelook:fixtures:load -q --no-interaction --env=test \
	&& php vendor/bin/behat --stop-on-failure

ci_phpstan:
	cd app \
	&& php vendor/bin/phpstan analyze -c phpstan.dist.neon --memory-limit 1G

ci_security:
	cd app \
	&& php vendor/bin/var-dump-check --symfony src \
	&& composer audit \
	&& yarn audit

ci_ecs:
	cd app \
	&& php vendor/bin/php-cs-fixer check src

ci_phpunit:
	cd app \
	&& php bin/console importmap:install \
	&& php bin/console asset-map:compile \
	&& php bin/console doctrine:database:create -q --env=test \
	&& php bin/console doctrine:schema:create -q --env=test \
	&& php bin/console hautelook:fixtures:load -q --no-interaction --env=test \
	&& php bin/phpunit -d memory_limit=-1 --colors=always --stop-on-failure
##

.PHONY: up-display down-display

up-display:
	@echo ""
	@echo "\033[1;35m============================================================================\e[0m"
	@echo "\033[1;96m     __               ___                     ___       _ _     _           "
	@echo "  /\ \ \___  ___     / _ \__ _  __ _  ___    / __\_   _(_) | __| | ___ _ __ "
	@echo " /  \/ / _ \/ _ \   / /_)/ _\` |/ _\` |/ _ \  /__\// | | | | |/ _\` |/ _ \ '__|"
	@echo "/ /\  /  __/ (_) | / ___/ (_| | (_| |  __/ / \/  \ |_| | | | (_| |  __/ |   "
	@echo "\_\ \/ \___|\___/  \/    \__,_|\__, |\___| \_____/\__,_|_|_|\__,_|\___|_|"
	@echo "                               |___/                                        \e[0m"
	@echo ""
	@echo ""
	@echo "  \033[1;44m URLS List \e[0m"
	@echo ""
	@echo "\033[1;94m   - Website: \033[4;33mhttps://page-builder.docker.localhost\e[0m"
	@echo "\033[1;93m   - Adminer: \033[4;33mhttps://adminer.docker.localhost\e[0m"
	@echo "\033[1;93m   - Traefik: \033[4;33mhttps://traefik.docker.localhost\e[0m"
	@echo "\033[1;93m   - Mailer: \033[4;33mhttps://mailer.docker.localhost\e[0m"
	@echo ""
	@echo "\033[1;35m============================================================================\e[0m"
	@echo ""
	@echo "  \033[1;44m Page builder containers list \e[0m"
	@echo "\033[1;36m"
	@docker ps --filter "name=page_builder" --format "table {{.ID}}\t{{.Names}}\t{{.Ports}}"
	@echo ""
	@echo "\033[1;35m============================================================================\e[0m"
	@echo ""

down-display:
	@echo ""
	@echo "\033[1;35m============================================================================\e[0m"
	@echo "\033[1;96m     __               ___                     ___       _ _     _           "
	@echo "  /\ \ \___  ___     / _ \__ _  __ _  ___    / __\_   _(_) | __| | ___ _ __ "
	@echo " /  \/ / _ \/ _ \   / /_)/ _\` |/ _\` |/ _ \  /__\// | | | | |/ _\` |/ _ \ '__|"
	@echo "/ /\  /  __/ (_) | / ___/ (_| | (_| |  __/ / \/  \ |_| | | | (_| |  __/ |   "
	@echo "\_\ \/ \___|\___/  \/    \__,_|\__, |\___| \_____/\__,_|_|_|\__,_|\___|_|"
	@echo "                               |___/                                        \e[0m"
	@echo ""
	@echo "\033[1;93m                               GoodBye \e[0m"
	@echo ""
	@echo "\033[1;35m============================================================================\e[0m"
	@echo ""
	@echo "  \033[1;44m Page builder containers list: \e[0m"
	@echo "\033[1;36m"
	@docker ps --filter "name=page_builder" --format "table {{.ID}}\t{{.Names}}\t{{.Ports}}"
	@echo ""
	@echo "\033[1;35m============================================================================\e[0m"
	@echo ""
