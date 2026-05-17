#!/bin/bash

# Usage:
# ./git-feature.sh <feature-branch> "<commit message>" [base-branch]

BRANCH_NAME=$1
COMMIT_MSG=$2
BASE_BRANCH=${3:-develop}  # default is develop if not provided

if [ -z "$BRANCH_NAME" ] || [ -z "$COMMIT_MSG" ]; then
  echo "❌ Usage: ./git-feature.sh <branch-name> \"commit message\" [base-branch]"
  exit 1
fi

echo "🚀 Creating feature branch: $BRANCH_NAME"

git checkout -b "$BRANCH_NAME"

echo "📦 Adding changes..."
git add .

echo "💬 Committing changes..."
if git diff --cached --quiet; then
  echo "⚠️ No staged changes to commit"
  exit 0
else
  git commit -m "$COMMIT_MSG"
fi

echo "🔄 Fetching latest from origin..."
git fetch origin

echo "🔀 Rebasing on origin/$BASE_BRANCH..."
git rebase "origin/$BASE_BRANCH"

if [ $? -ne 0 ]; then
  echo "⚠️ Rebase conflict detected."
  echo "Fix conflicts then run:"
  echo "   git rebase --continue"
  exit 1
fi

echo "⬆️ Pushing branch..."
git push -u origin "$BRANCH_NAME"

echo "✅ Done!"