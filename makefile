CHROME_PACKAGE = ./dist/aws-peacock-management-console_chrome.zip

.PHONY: archive

archive: $(CHROME_PACKAGE);
$(CHROME_PACKAGE):
	zip -r $(CHROME_PACKAGE) manifest.json *.html *.js icons/
