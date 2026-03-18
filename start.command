#!/bin/zsh

cd "$(dirname "$0")"

# Backend'i arka planda başlat
npm run dev:backend &

# Frontend'i önde başlat
npm run dev:frontend

