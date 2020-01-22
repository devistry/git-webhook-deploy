#!/bin/bash
BRANCH=$1
FOLDER=$(date +%Y%m%d_%H%M%S)
OLD_FOLDER=$(find /opt/webfiles/admin/history -maxdepth 1 -type d -printf '%T@\t%p\n' | sort -r | tail -n 1 | sed 's/[0-9]*\.[0-9]*\t//')
CHOWN="www-data"
CHGRP="www-data"

SCRIPT_LOCATION=$(readlink -f "$0")
BASEDIR=$(dirname "$SCRIPT_LOCATION")

#check to make sure a branch was specified
if [ -z $BRANCH ]
then
    echo "Git Branch not specified"
    exit 0
fi

echo " "
echo "Navigate to repo folder $BASEDIR/repo"
cd $BASEDIR/repo

echo " "
echo -e "Stash any unsaved changes.\e[32m"
git stash

echo -e "\e[0m"
echo -e "Checkout the $BRANCH branch.\e[32m"
git checkout $BRANCH

echo -e "\e[0m"
echo -e "Pull any changes.\e[32m"
git pull
echo -e "\e[0m"

if [ $(find $BASEDIR/history -maxdepth 1 -type d -print | wc -l) -gt 5 ]
then
    echo -e "Removing old history folder \e[32m$OLD_FOLDER\e[0m"
    rm -r -f $OLD_FOLDER
fi

echo " "
echo -e "Create a folder to store repo history \e[32m/opt/webfiles/admin/history/$FOLDER\e[0m"
mkdir $BASEDIR/history/$FOLDER

echo " "
echo "Copy latest repo files to new history folder"
cp -r $BASEDIR/repo/. $BASEDIR/history/$FOLDER

echo " "
echo "Change ownership and group of web content folder"
cd $BASEDIR/repo
chown -R $CHOWN .
chgrp -R $CHGRP .

echo " "
