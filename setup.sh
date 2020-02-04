#!/usr/bin/env bash

printf "Do PI Setup\n"

printf "*do system update\n"
(sudo apt-get -y update)

printf "*install software-properties-common\n"
(sudo apt-get install -y curl software-properties-common)
(sudo apt-get install -y moreutils)

printf "*add package repos\n"
(sudo add-apt-repository -y ppa:openjdk-r/ppa)

printf "*add MATRIXLabs repo"
(curl https://apt.matrix.one/doc/apt-key.gpg | sudo apt-key add -
echo "deb https://apt.matrix.one/raspbian $(lsb_release -sc) main" | sudo tee /etc/apt/sources.list.d/matrixlabs.list)

printf "*do system update (again)\n"
(sudo apt-get -y update)

printf "*install MATRIX HAL"
(sudo apt-get install matrixio-creator-init libmatrixio-creator-hal libmatrixio-creator-hal-dev)

printf "*install default JRE\n"
(sudo apt-get install -y default-jre)

printf "*install node 11/x\n"
(sudo apt-get remove -y nodejs)
(curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
sudo apt-get install -y nodejs)

printf "*install java\n"
(sudo apt-get install -y openjdk-9-jre openjdk-9-jdk)

printf "*install node packages"
cd bridge
npm install

printf "Done.\n"
