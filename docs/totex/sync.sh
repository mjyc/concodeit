#!/usr/bin/env bash

read -p "This may overwrite existing files in your paper directory. Are you sure? [Y/n] " -n 1
echo
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  cp -v tex/*.tex paper/
fi
