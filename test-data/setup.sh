#!/bin/sh -e
curl --output unum.tsv.zip "https://s3.amazonaws.com/firstdraftgis/unum.tsv.zip"

unzip unum.tsv.zip

# rm unum.tsv.zip

head -n 1001 unum.tsv > unum_1k.tsv

head -n 10001 unum.tsv > unum_10k.tsv
