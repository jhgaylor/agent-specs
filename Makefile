# Disable the CLI self-update notice: fountain captures infisical's output
# when resolving infisical:// secret URIs, and the banner corrupts the values.
INFISICAL := INFISICAL_DISABLE_UPDATE_CHECK=true infisical run --env=dev --

.PHONY: apply run install

apply:
	$(INFISICAL) fountain apply -f .

run:
	$(INFISICAL) fountain run $(AGENT) -p $(PROMPT) $(ARGS)

install:
	gh release download --repo BinaryBourbon/fountain --pattern 'fountain-darwin-arm64' -O ~/.local/bin/fountain --clobber && chmod +x ~/.local/bin/fountain
