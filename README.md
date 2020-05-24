# Installation
You need to have Node.js installed. Tested with Node.js = 12.14.0
Clone this git repo `git clone git@github.com:juansgaitan/node-tools.git`
Add the path to this repo to your `PATH` by editing your `.bashrc` or `.bash_profile`.
`export PATH="/path/to/this/repo:$PATH"`

### Follow redirects (fredirect)
`cat urls.txt | fredirect`
`fredirect URL`

### Have I been pwned?
`cat emails.txt | pwned`
`pwned EMAIL`