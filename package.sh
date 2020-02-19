
printf "Packaging app\n"

rm -rf ./server/dist

mkdir ./server/dist

printf "\nBuild App Server\n"
cd server/
./gradlew build

printf "\nPrepare App Server Dist folder\n"
tar -xf ./server/build/distributions/swim-matrixone-3.10.0.tar -C ./server/dist/
rm server/dist/swim-matrixone-3.10.0/lib/jffi-1.2.17-native.jar

cd ../

printf "\ndone.\n"