yarn --cwd ~/invitationals-frontend/ build
rm -rf *.{svg,js,ico,html,png,json,txt}
cp -rf ~/invitationals-frontend/dist/* .
git add -A
git commit -m ${1:-"yiha"}
git push