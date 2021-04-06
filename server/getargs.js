'use strict';

/**  Get command line arguments
*
*  @param {string[]}  argv
*  @param {string}    usage
*  @returns {object}
*/
const getArgs = (argv, usage) => {
	let argObj = {};
	for (let i = 0; i < argv.length; i++) {
		switch(argv[i]) 
		{
			case '--port':
			if (i < argv.length - 1)
			{
				let portNum = parseInt(argv[++i], 10);
				if (isNaN(portNum))
					console.log(usage);
				else
					argObj.port = portNum;
			}
			else
				console.log(usage);
			break;
		
			case '--verbose':
				argObj.verbose = true;
			break;
		
			default:
				console.log(usage);
			break;
		}	
	}
	return argObj;
}

module.exports = getArgs ;  
