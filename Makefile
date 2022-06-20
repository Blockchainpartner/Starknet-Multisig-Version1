# Build and test
build :; nile compile
test  :; pytest tests/ -W ignore::DeprecationWarning
