At first you need to install redis on your pc
Then write npm i to download all dependencies 
Then npm run start
Then in browser open page with url http://localhost:8080/repos/{name of any git repo}
Data in requests is being cached on the first requests,
and on the other ones we get it from cache
For load time check devtools/network
