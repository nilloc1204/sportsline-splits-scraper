# GitHub Quick Reference Guide

## Basic Git Commands

### 1. Regular Workflow

#### Making commits
```bash
# Add specific files
git add filename.js filename2.css

# Add all changed files
git add .

# Commit with a message
git commit -m "Clear description of changes"
```

#### Pushing changes to GitHub
```bash
# Push to the current branch
git push

# First time pushing a new branch
git push -u origin branch-name
```

#### Getting updates from GitHub
```bash
# Update your local repository with remote changes
git pull
```

### 2. Working with Branches

#### Creating a new branch
```bash
# Create and switch to a new branch
git checkout -b new-feature-name

# Alternative in newer Git versions
git switch -c new-feature-name
```

#### Switching branches
```bash
# Switch to an existing branch
git checkout branch-name

# Alternative in newer Git versions
git switch branch-name
```

#### Merging branches
```bash
# First switch to the target branch (often main)
git checkout main

# Then merge your feature branch
git merge feature-branch
```

### 3. Repository Status

#### Checking status
```bash
# See what files are changed, staged, etc.
git status
```

#### Viewing history
```bash
# See commit history
git log

# See compact history
git log --oneline

# See history with branch visualization
git log --graph --oneline --all
```

### 4. Undoing Changes

#### Discard changes in working directory
```bash
# Discard changes to a specific file
git restore filename.js

# Discard all changes
git restore .
```

#### Unstage files
```bash
# Remove file from staging area
git restore --staged filename.js
```

#### Undo the last commit (keeping changes)
```bash
git reset HEAD~1
```

### 5. Remote Operations

#### Adding a remote
```bash
git remote add origin https://github.com/username/repo-name.git
```

#### Changing a remote URL
```bash
git remote set-url origin https://github.com/username/new-repo-name.git
```

#### Viewing remotes
```bash
git remote -v
```

## Best Practices

1. **Make frequent, small commits** with descriptive messages
2. **Pull before you push** to avoid merge conflicts
3. **Create branches** for new features or experiments
4. **Use .gitignore** to exclude files that shouldn't be tracked
5. **Write meaningful commit messages** (describe why, not just what)
6. **Review changes before committing** using `git diff` or `git status`

## Git Configuration

```bash
# Set your username
git config --global user.name "Your Name"

# Set your email
git config --global user.email "your.email@example.com"

# Set default branch name
git config --global init.defaultBranch main
```

## Helpful Resources

- [GitHub Docs](https://docs.github.com/en)
- [Git Cheat Sheet by GitHub](https://education.github.com/git-cheat-sheet-education.pdf)
- [Oh Shit, Git!?!](https://ohshitgit.com/) - For fixing Git mistakes 