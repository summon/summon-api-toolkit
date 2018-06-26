from dotenv import load_dotenv
import os
from flask import Flask, render_template, request
from modules import summonapi


'''
Create a file named ".env" and add your Summon API credentials as follows:
ACCESS_ID=youraccessid
API_KEY=yourapikey
Ensure that this file is never committed to version control. Or if you prefer,
set ACCESS_ID and API_KEY environment variables and then remove dotenv lines
'''
load_dotenv('.env')
access_id = os.environ['ACCESS_ID']
api_key = os.environ['API_KEY']

app = Flask(__name__)


@app.route('/', methods=['GET', 'POST'])
def index():
    # Search parameters from URL parameters
    if request.method == 'GET' and len(request.args) != 0:
        # cannot use to_dict like POST since multiple s.fvf would be dropped
        params = [(k, v) for k, v in request.args.items(multi=True)]
    # Search parameters from HTML form
    elif request.method == 'POST':
        params = request.form.to_dict()
    # No search has been performed yet, return blank template
    else:
        return render_template('index.html')

    try:
        response = summonapi.search(access_id, api_key, params)
        return render_template('index.html', response=response)
    except Exception as error:
        return render_template('index.html', error=error)


if __name__ == '__main__':
    app.run()
