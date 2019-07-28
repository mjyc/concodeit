#!/usr/bin/env bash

read -p "This may overwrite existing files in your paper directory. Are you sure? (y/n) " -n 1
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  cp tex/*.tex paper/
fi
