{ pkgs ? import (fetchTarball https://github.com/NixOS/nixpkgs/archive/a54e68bad4f42c92ac65fad800273d04dcbd3d38.tar.gz) { } }:
pkgs.mkShell {
  buildInputs = with pkgs; [
    # AWS CLI requirements
    awscli2
    nodejs

    # Rust requirements
    cargo
    clippy
    rustc
    rustfmt
  ];
}
