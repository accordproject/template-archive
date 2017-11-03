echo "Tag is " $1
lerna publish --yes --conventional-commits -m "chore(release): publish %s"
echo "Published to npm using lerna."
