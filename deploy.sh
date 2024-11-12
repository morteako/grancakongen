yarn --cwd ~/invitationals-frontend/ build
cp -rf ~/invitationals-frontend/dist dist
git add -A
git commit -m ${1:-"yiha"}
git push