#!/usr/bin/env bash

# if there is a setup flag, do the setup TODO do this when the config does not exist

if [[ $1 = "setup" ]]
   then
     # Ask the user for location where Orviz should be.
     read -p 'Type the full location of where you want the Orviz directory to be. This should be outside your org-roam directory: ' orviz_dir
     mkdir -p "$orviz_dir/public/static" # TODO do it only when the dir does not already exist
     # Ask the user the current location of their org-roam directory
     read -p 'Type the full location of your current org-roam directory: ' orgroam_dir
     cp -i index.html $orviz_dir
     cp -i stylesheet.css $orviz_dir/public/static/
     cp -i processing.js $orviz_dir

     # store the config file in ~/.config/orviz/config.json

     mkdir -p ~/.config/orviz/
     echo "{\"orviz_dir\": \"$orviz_dir\", \"orgroam_dir\": \"$orgroam_dir\"}" > ~/.config/orviz/config.json
fi

# parse the config file

orviz_dir=$(jq -r '.orviz_dir' ~/.config/orviz/config.json)
orgroam_dir=$(jq -r '.orgroam_dir' ~/.config/orviz/config.json)

cd $orviz_dir
echo $orviz_dir
cp ~/.config/orviz/config.json $orviz_dir # copy the config for easy access from orviz directory
node processing.js
http-server . -p 1729
