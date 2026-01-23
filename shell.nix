{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  name = "url-shortener-env";

  buildInputs = [
    # --- Backend Stack (PHP 8.4 + Extensions) ---
    (pkgs.php84.buildEnv {
      extensions = ({ enabled, all }: enabled ++ (with all; [
        amqp        # The one that caused all the pain on macOS
        pdo_pgsql   # For Postgres
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

    # --- Frontend Stack (Node.js + Tools) ---
    pkgs.nodejs
    pkgs.nodePackages.pnpm  # Faster than npm, optional but recommended
    
    # --- Infrastructure ---
    pkgs.docker
    pkgs.docker-compose
    pkgs.git
  ];

  shellHook = ''
    echo " PHP Version: $(php -v | head -n 1 | cut -d' ' -f2)"
    echo " Node Version: $(node -v)"
    export COMPOSER_MEMORY_LIMIT=-1
  '';
}
