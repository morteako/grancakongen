yarn --cwd ~/invitationals-frontend/ build
cp -r ~/invitationals-frontend/dist/* .
git add -A
git commit -m ${1:-"yiha"}
git push