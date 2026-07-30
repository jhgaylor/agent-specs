INFISICAL := infisical run --env=dev --

.PHONY: apply run install

apply:
	$(INFISICAL) npm run apply

run:
	$(INFISICAL) fountain run $(AGENT) -p $(PROMPT) $(ARGS)

install:
	npm install
	gh release download --repo BinaryBourbon/fountain --pattern 'fountain-darwin-arm64' -O ~/.local/bin/fountain --clobber && chmod +x ~/.local/bin/fountain
