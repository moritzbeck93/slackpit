VERSION := $(shell node -p "require('./package.json').version")

.PHONY: dev build release install clean

dev:
	npx tsx src/bin.ts

build:
	npm run build:release

release: build
	@echo "Built slackpit v$(VERSION) -> dist/slackpit"
	@ls -lh dist/slackpit

install: build
	cp dist/slackpit /usr/local/bin/slackpit
	@echo "Installed slackpit to /usr/local/bin/slackpit"

clean:
	rm -rf dist
