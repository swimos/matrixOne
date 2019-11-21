#!/usr/bin/env bash

printf "Start Node Bridge\n"

rm bridge.log
rm bridge.err

cd ./bridge
node bridge.js > ../bridge.log 2> ../bridge.err < /dev/null &

