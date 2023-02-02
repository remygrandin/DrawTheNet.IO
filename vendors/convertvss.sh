#!/bin/bash  
ciscoPath="./Cisco/Icons/"
rm -rf $ciscoPath
mkdir $ciscoPath
vss2svg-conv -i ./Cisco/3015.vss -o $ciscoPath -s 1
vss2svg-conv -i ./Cisco/Telepresence.vss -o $ciscoPath -s 1
#vss2svg-conv -i ./Cisco/doc.vss -o ./Cisco/Icons/ -s 1
