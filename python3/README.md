# Summon API Demo (Python 3)

This is a demo implementation of the Summon API using Python 3 and Flask.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

You must have Python 3 and pip installed. For Windows, it is recommended to install the [latest version of Python](https://www.python.org/downloads/windows/) or at least Python 3.4+ as pip is already included. If you must use an earlier version of Python 3 see [this guide](https://packaging.python.org/tutorials/installing-packages/#requirements-for-installing-packages) for installing pip.

It is also recommended but not required to [create a virtual environment](https://packaging.python.org/tutorials/installing-packages/#creating-virtual-environments) to avoid causing problems with any other python packages you may have installed.

### Installing

1. Navigate to the app folder containing requirements.txt and run:

```
pip install -r requirements.txt
```

2. Create a plain text file with the file name ".env" (in Windows environments, ensure that no hidden file extension such as ".txt" has been added to the file). Add the following two lines:

```
ACCESS_ID=youraccessid
API_KEY=yourapikey
```

Ensure that this file is never committed to version control to avoid compromising your credentials. If you do not have Summon API credentials, see [this article](https://knowledge.exlibrisgroup.com/Summon/Product_Documentation/Configuring_The_Summon_Service/Configurations_Outside_of_the_Summon_Administration_Console/Summon%3A_Using_the_Summon_API) for instructions on how to request them.

3. Run app.py with:
```
python app.py
```

4. If you receive no errors in step 3, open a web browser and go to [127.0.0.1:5000](http://127.0.0.1:5000) to view the demo.

## Deployment

See "deployment" folder for notes on how to deploy the project on a live system.

## Built With

* [Flask](http://flask.pocoo.org) - Used as the web framework
* [requests](http://docs.python-requests.org/en/master/) - Used to make the HTTP request to the Summon API
* [dotenv](https://github.com/theskumar/python-dotenv) - Used to load the Summon API credentials into environment variables from ".env" file. Avoids differences in setting environment variables between Windows, Mac and Linux environments.

