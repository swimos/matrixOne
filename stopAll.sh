#!/usr/bin/env bash

#include global vars
path=$(pwd)
printf "Stop Node and Swim\n"

(cd $path;
    killall java
    killall node)

printf "Done.\n"