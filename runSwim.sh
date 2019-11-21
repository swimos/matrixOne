#!/usr/bin/env bash

printf "Start SWIM\n"

rm swim.log
rm swim.err

cd ./server
./gradlew run > ../swim.log 2> ../swim.err < /dev/null &

# tail -f ../swim.log