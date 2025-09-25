{ pkgs, ... }: {
  # Use the stable channel for nix packages.
  channel = "stable-24.05";

  # Packages to make available in the environment.
  packages = [
    pkgs.nodejs_20 # We need Node.js and npm.
    pkgs.nodePackages.http-server # Provides the http-server command for our preview.
  ];

  # VS Code extensions to install.
  idx = {
    # Workspace lifecycle hooks.
    workspace = {
      # Runs when the workspace is first created.
      onCreate = {
        # Install npm dependencies from package.json
        # npm-install = "npm install";
      };
    };

    # Configure a web preview for our application.
    previews = {
      enable = true;
      previews = {
        web = {
          # Command to start a simple web server. We can call http-server
          # directly since it's in our Nix packages. The -c-1 flag disables caching.
          command = ["http-server" "-p" "$PORT" "--cors" "-c-1"];
          manager = "web";
        };
      };
    };
  };
}
