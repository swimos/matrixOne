#!/usr/bin/env bash

printf "Start Matrix One Demo App\n"

rm *.log
rm *.err

printf "Start Swim Server\n"
cd ./server
./dist/swim-matrixone-3.10.0/bin/swim-flightInfo  > ../swim.log 2> ../swim.err < /dev/null &

printf "Start Node Bridge\n"
cd ../bridge
node bridge.js  > ../bridge.log 2> ../bridge.err < /dev/null &

cd ../

printf "Startup complete\n"