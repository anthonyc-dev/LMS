#!/bin/bash

# Check if branch name is provided
if [ -z "$1" ]; then
    echo "❌ Error: Please provide branch name"
    echo "Usage: ./git-delete-branch.sh <branch-name>"
    exit 1
fi

BRANCH_NAME=$1

# Check if branch exists locally
if ! git show-ref --verify --quiet refs/heads/$BRANCH_NAME; then
    echo "❌ Error: Local branch '$BRANCH_NAME' does not exist"
    exit 1
fi

# Delete local branch
echo "🗑️  Deleting local branch: $BRANCH_NAME"
git branch -d $BRANCH_NAME

# Check if remote branch exists
if git ls-remote --heads origin $BRANCH_NAME | grep -q $BRANCH_NAME; then
    # Delete remote branch
    echo "🗑️  Deleting remote branch: $BRANCH_NAME"
    git push origin --delete $BRANCH_NAME
    echo "✅ Branch '$BRANCH_NAME' deleted successfully (local & remote)"
else
    echo "ℹ️  Remote branch '$BRANCH_NAME' does not exist"
    echo "✅ Local branch deleted successfully"
fi