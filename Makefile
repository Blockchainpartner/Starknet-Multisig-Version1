# Build and test
build :; nile compile
#test  :; pytest tests/test_multisig_base.py -W ignore::DeprecationWarning
#test  :; pytest tests/test_multisig_extended.py -W ignore::DeprecationWarning
test :; pytest tests/ -W ignore::DeprecationWarning
