#!/usr/bin/env bash

sudo yum install -y yum-utils
sudo yum-config-manager --enable ol7_developer_nodejs10

cd /etc/yum.repos.d
mv public-yum-ol7.repo public-yum-ol7.repo.bak
wget http://yum.oracle.com/public-yum-ol7.repo

sudo yum install nodejs