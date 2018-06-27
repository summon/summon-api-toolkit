# Summon API Demo (Node.js)

This is a demo implementation of the Summon API using Node.js

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You must have [Node.js](https://nodejs.org/en/) and npm installed (usually installed alongside Node.js).

### Installing

1. Navigate to the node.js folder containing package.json and run:

```
npm install
```

2. Create a plain text file with the file name ".env" (in Windows environments, ensure that no hidden file extension such as ".txt" has been added to the file). Add the following two lines:

```
ACCESS_ID=youraccessid
API_KEY=yourapikey
```

Ensure that this file is never committed to version control to avoid compromising your credentials. If you do not have Summon API credentials, see [this article](https://knowledge.exlibrisgroup.com/Summon/Product_Documentation/Configuring_The_Summon_Service/Configurations_Outside_of_the_Summon_Administration_Console/Summon%3A_Using_the_Summon_API) for instructions on how to request them.

3. Run summonapidemo.js with:
```
node summonapidemo.js
```

Or (depending on your environment):
```
nodejs summonapidemo.js
```

4. If the above steps were followed you should see the message "Server running at [127.0.0.1:8080](http://127.0.0.1:8080)". Open a web browser and go to [127.0.0.1:8080](http://127.0.0.1:8080) to view the demo.

## Built With

* [express](https://expressjs.com) - Used as the web framework
* [ejs](http://ejs.co) - Used as the templating engine
* [request](https://www.npmjs.com/package/request) - Used to make the HTTP request to the Summon API. Similar to the Python [requests](http://docs.python-requests.org/en/master/) library.
* [dotenv](https://www.npmjs.com/package/dotenv) - Used to load the Summon API credentials into environment variables from an ".env" file. Avoids differences in setting environment variables between Windows, Mac and Linux environments.

