
mkdir ../tmplibvisio2svg/
cd ../tmpvendors/
git clone https://github.com/kakwa/libvisio2svg.git
cd libvisio2svg
cmake . -DCMAKE_INSTALL_PREFIX=/usr/
make
make install

cd ..

wget https://www.cisco.com/c/dam/en_us/about/ac50/ac47/3015VSS.zip -O cisco.zip
unzip cisco.zip -d cisco
cd cisco
