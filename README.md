# Scripts
Ray's machine scripts

## Setup
Recommend adding aliasi to your bash/z profile
```sh
alias scripts='{path-to}/node/v14.15.1/bin/node {path-to}/scripts/scripts/index.js'
alias ppurge='{path-to}/node/v14.15.1/bin/node {path-to}/scripts/purge/index.js'
```

## Usage
```sh
ppurge --dryrun --fast
scripts
echo "that was easy..."
```

## Purge
Looks for a `.ppurge` file in the root of the file its pointed to. For me `/Users/rayepps/projects`. Looks like
```
**/node_modules
**/venv
**/*.zip
**/projects/go
!**/projects/recon
!**/projects/scripts
```

Since I'm here writing this, here are some other good alisi
```sh
alias alist='cat ~/.zprofile | grep alias'
alias py='python3'
alias py37='/usr/local/opt/python@3.7/bin/python3'
alias py38='/Library/Frameworks/Python.framework/Versions/3.8/bin/python3'
alias venv='python3 -m venv venv'
alias venv37='py37 -m venv venv'
alias activate='source venv/bin/activate'
alias pip-freeze='pip freeze > requirements.txt'
alias dynamo-ui='DYNAMO_ENDPOINT=http://localhost:4569 dynamodb-admin'
alias tf='terraform'
```

Oh and this is good too
```sh
function cra() {
  npm init react-app "$@"
}
```