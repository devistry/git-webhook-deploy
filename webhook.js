/**
 * Nodejs application to handle webhook requests from GitHub
 * Add folders 'history' and 'repo' in this folder
 */

//set variables defining secret, script for updating the repo and the branch to monitor
const secret = "SECRET_SET_IN_GITHUB";
const branch = "BRANCH_NAME";
const updaterepo = "sudo /opt/webfiles/updatelocalrepo.sh " + branch;
const logfilelocation = '/opt/webfiles/logs/';

//nodejs modules required running nodejs application
const http = require('http');
const crypto = require('crypto');
const exec = require('child_process').exec;
const fs = require('fs');

//create the http server used for monitoring the webhoook
http.createServer(function (req, res) {

	//set variables
	let bodyArr = [];
	let bodyLen = 0;

	//grab all the chunks from the request and combine together and place in variables
	req.on('data', function(chunk) {
		bodyArr.push( chunk );
		bodyLen += chunk.length;
	});

	//once completed, work through the request
	req.on('end', () => {

		//determine signature based on request body
    var data = Buffer.concat(bodyArr, bodyLen).toString();
		var sig = 'sha1=' + crypto.createHmac('sha1', secret).update(data).digest('hex');

		//check to see if the request is valid - signatures match - they do so continue
		if ( req.headers['x-hub-signature'] === sig ) {

			//get an object from sent request
			objBody = JSON.parse( data );

			//check to make sure it is closed action and a pull request
			if ( objBody.action === 'closed' && objBody.pull_request ) {

				//check for the branch match to branch outlined above
				if ( objBody.pull_request.base.ref === branch ) {

					//output to console and set filename date
					let filedate = Date.now();
					console.log( 'Continue: Closed, Pull Request, ' + branch );

					//write the request to a webhook file
					fs.writeFile( logfilelocation + 'webhook_' + filedate + '.json', JSON.stringify(objBody), function(err){
						if (err) {
							return console.log(err);
						}
						console.log( 'Log file created: ' + logfilelocation + 'webhook_' + filedate + '.json' );
					});

					//run the update repo command
					console.log( 'Updating local repo' );
					let execProcess = exec( updaterepo );
					let updateRepoOutput = [];
					execProcess.stdout.on('data', function(data) {
						//console.log(data);
						updateRepoOutput.push(data);
					});

					execProcess.on('close', (code) => {
						//write the request to a webhook file
						fs.writeFile( logfilelocation + 'updaterepooutput_' + filedate + '.txt', updateRepoOutput.toString(), function(err){
							if (err) {
								return console.log(err);
							}
						});
						console.log( 'Log file created: ' + logfilelocation + 'updaterepooutput_' + filedate + '.txt' );
						console.log( 'Completed repo update.' );
					});

					execProcess.on('exit', (code) => {
						//do nothing
					});

				//branch does not match
				} else {
					console.log( 'Non-matching branches' );
				} //end if ( objBody.pull_request.base.ref === branch ) {

			//either action not closed or not pull request
			} else {
				console.log( 'Not a pull request or not closed' );
			} //end if (objBody.action === 'closed' && objBody.pull_request) {

		//if the signatures do not match
		} else {
			console.log( 'Signatures do not match' );
		} //end if ( req.headers['x-hub-signature'] === sig ) {

	}); //end }).on('end', () => {

	//send the end response
	res.end();

}).listen(4567);
