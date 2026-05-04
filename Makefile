AOD_BASE_URL ?= http://localhost:4000
AOD_TOKEN    ?=
export AOD_BASE_URL AOD_TOKEN

INFISICAL := infisical run --env=dev --

.PHONY: apply up down run install

apply:
	$(INFISICAL) aod apply .

up:
	$(INFISICAL) aod up $(ARGS)

down:
	$(INFISICAL) aod down $(ARGS)

run:
	$(INFISICAL) aod run $(AGENT) -p $(PROMPT) $(ARGS)

install:
	gh release download v0.2.9 --repo jhgaylor/aod-ex --pattern 'aod-macos-aarch64' -O ~/.local/bin/aod --clobber && chmod +x ~/.local/bin/aod