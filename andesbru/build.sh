#!/bin/sh
# Býr til andesbru/index.html (sjálfstæða síðu) úr andesbru/game.html.
cd "$(dirname "$0")"
{
  printf '<!doctype html>\n<html lang="is">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n</head>\n<body>\n'
  cat game.html
  printf '</body>\n</html>\n'
} > index.html
