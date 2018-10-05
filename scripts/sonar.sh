#!/usr/bin/env bash

if [ "$CIRCLE_PULL_REQUEST" ] 
then
  PRNUM="$(cut -d'/' -f7 <<< "$CIRCLE_PULL_REQUEST")"
  ./node_modules/.bin/sonar-scanner -Dsonar.host.url="https://sonarcloud.io" -Dsonar.login="$SONAR_TOKEN" -Dsonar.pullrequest.branch="$CIRCLE_BRANCH" -Dsonar.pullrequest.base="master" -Dsonar.pullrequest.key="$PRNUM" -Dsonar.pullrequest.provider="GitHub" -Dsonar.pullrequest.github.repository="propelmarketing/th-form"
else
  ./node_modules/.bin/sonar-scanner -Dsonar.host.url="https://sonarcloud.io" -Dsonar.login="$SONAR_TOKEN" -Dsonar.branch.name="$CIRCLE_BRANCH"
fi