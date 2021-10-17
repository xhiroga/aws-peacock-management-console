CHROME_PACKAGE = ./archives/aws-peacock-management-console_chrome.zip

.PHONY: archive

archive: $(CHROME_PACKAGE);
$(CHROME_PACKAGE):
	zip -r $(CHROME_PACKAGE) dist/*
