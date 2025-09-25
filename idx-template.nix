# This is a basic template with no user-configurable parameters.
{ pkgs, ... }: {
  # The bootstrap value contains a shell script that sets up the new workspace.
  bootstrap = ''
    # 1. Copy all files from the template's directory (`${./.}`)
    #    to the new workspace's output directory (`$out`).
    cp -rf ${./.} "$out"

    # 2. Set write permissions on all the new files and folders.
    chmod -R +w "$out"

    # 3. Clean up by removing the template-specific files and the Git history
    #    from the user's new workspace.
    rm -rf "$out/idx-template.nix" "$out/idx-template.json" "$out/.git"
  '';
}