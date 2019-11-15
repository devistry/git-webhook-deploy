# Git Webhook Deploy
 Nodejs application and linux shell script to manage auto deployment of files from GitHub webhook
 
== Installation ==

1. Clone the repo to a local folder. If folder other than /opt/webfiles/ then update code to match file location.
2. Create 3 folders: history, repo, logs
3. Open webhook.js and set the secret and branch to be used with GitHub
4. Change the port in webhook.js if required. Ensure the port is available and accessible on the server.
5. Install the webhook as a Systemd Service
6. In GitHub, set up the webhook (secret, server location along with port)
7. Start the service and test the webhook

== Notes ==
- this webhook will only trigger on closed pull requests for the specific branch
- this webhook is setup to specifically run in the /opt/webfiles/ folder on linux
- a rolling 5 copies of the repo will be kept in the history folder
- no log cleanup method has been added
