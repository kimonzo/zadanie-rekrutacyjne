{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  name = "url-shortener-env";

  buildInputs = [
    # --- Backend Stack (PHP 8.4 + Extensions) ---
    (pkgs.php84.buildEnv {
      extensions = ({ enabled, all }: enabled ++ (with all; [
        amqp        # Essential for RabbitMQ
        pdo_pgsql   # Essential for PostgreSQL
        intl
        zip
        mbstring
        opcache
      ]));
      extraConfig = ''
        memory_limit = 2G
        date.timezone = UTC
      '';
    })
    pkgs.php84Packages.composer
    pkgs.symfony-cli

    # --- Frontend Stack ---
    pkgs.nodejs
    pkgs.nodePackages.pnpm
    
    # --- Infrastructure ---
    pkgs.docker
    pkgs.docker-compose
    pkgs.git
  ];

  shellHook = ''
    echo " PHP Version: $(php -v | head -n 1 | cut -d' ' -f2)"
    echo " Extensions: $(php -m | grep -E 'amqp|pdo_pgsql' | tr '\n' ' ')"
    echo " Docker Compose: $(docker-compose version --short)"
    export COMPOSER_MEMORY_LIMIT=-1
  '';
}
