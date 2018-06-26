#!/usr/bin/python3
# adapted from https://github.com/JeffHall/summon-api-demo
import base64
import hashlib
import hmac
from urllib.parse import urlencode, quote_plus, unquote_plus
from datetime import datetime
import requests


def search(access_id, api_key, params):
    host = 'api.summon.serialssolutions.com'
    path = '/2.0.0/search'
    query = urlencode(params, doseq=True, quote_via=quote_plus)
    headers = build_headers(access_id, api_key, host, path, query)
    print('headers')
    print(headers)

    url = 'http://{}{}?{}'.format(host,
                                  path,
                                  query)
    response = requests.get(url, headers=headers)
    return response.text


def build_headers(access_id, api_key, host, path, query):
    accept = 'application/json'
    date = datetime.utcnow().strftime('%a, %d %b %Y %H:%M:%S GMT')
    print('date')
    print(date)

    query_string = unquote_plus('&'.join(sorted(query.split('&'))))

    id_string = "\n".join([accept, date, host, path, query_string]) + "\n"
    print('id_string')
    print(id_string)
    auth_string = build_auth_string(access_id, api_key, id_string)

    return {'Accept': accept,
            'x-summon-date': date,
            'Host': host,
            'Authorization': auth_string}


def build_auth_string(access_id, api_key, id_string):
    key = bytes(api_key, 'UTF-8')
    message = bytes(id_string, 'UTF-8')
    hashed_code = hmac.new(key,
                           message,
                           hashlib.sha1).digest()
    digest = base64.encodebytes(hashed_code).decode('UTF-8')

    auth_string = 'Summon {};{}'.format(access_id, digest)
    return auth_string.replace('\n', '')
