#!/bin/bash
BRANCH=$1
FOLDER=$(date +%Y%m%d_%H%M%S)
OLD_FOLDER=$(find /opt/webfiles/history -maxdepth 1 -type d -printf '%T@\t%p\n' | sort -r | tail -n 1 | sed 's/[0-9]*\.[0-9]*\t//')

#check to make sure a branch was specified
if [ -z $BRANCH ]
then
    echo "Git Branch not specified"
    exit 0
fi

echo " "
echo "Navigate to repo folder /opt/webfiles/repo"
cd /opt/webfiles/repo

echo " "
echo "Stash any unsaved changes."
git stash

echo " "
echo "Checkout the $BRANCH branch"
git checkout $BRANCH

echo " "
echo "Pull any changes"
git pull

if [ $(find /opt/webfiles/history -maxdepth 1 -type d -print | wc -l) -gt 5 ]
then
    echo " "
    echo "Removing old history folder - $OLD_FOLDER"
    rm -r -f $OLD_FOLDER
fi

echo " "
echo "Create a folder to store repo history - /opt/webfiles/history/$FOLDER"
mkdir /opt/webfiles/history/$FOLDER

echo " "
echo "Copy latest repo files to new history folder"
cp -r /opt/webfiles/repo/docroot/. /opt/webfiles/history/$FOLDER

echo " "
