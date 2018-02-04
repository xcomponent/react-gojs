#!/bin/bash
version=`git tag -l --points-at HEAD`

if [ ! -z "$version" ]; then
	if [[ $version == *"-BETA"* ]]; then
		echo "BETA"
	else
		echo "RELEASE"
	fi
else
	echo "FAILED"
fi