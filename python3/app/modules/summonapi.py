#!/usr/bin/python3
import base64
import hashlib
import hmac
from urllib.parse import urlencode, quote_plus, unquote_plus
from datetime import datetime
import requests


def search(access_id, api_key, params):
    """
    Searches the Summon API with the provided parameters.

    :param access_id: Your Summon API Access ID
    :param api_key: Your Summon API Key
    :param params: Search parameters, sent as dictionary or list of tuples
    :returns: JSON response from Summon API containing search results, etc.
    """
    host = 'api.summon.serialssolutions.com'
    path = '/2.0.0/search'
    query = urlencode(params, doseq=True, quote_via=quote_plus)

    headers = build_headers(access_id, api_key, host, path, query)
    print('Request headers: {}'.format(headers))

    url = 'http://{}{}?{}'.format(host,
                                  path,
                                  query)
    response = requests.get(url, headers=headers)
    return response.text


def build_headers(access_id, api_key, host, path, query):
    """
    Generates the request headers for the Summon API query.

    :param access_id: Your Summon API Access ID
    :param api_key: Your Summon API Key
    :param host: The Summon API host domain, defined in search function
    :param path: The Summon API search path, defined in search function
    :param query: URL-encoded query, created from params by search function
    :returns: Dictionary containing request headers for Summon API query
    """
    # application/xml also supported by Summon API but not used in this demo
    accept = 'application/json'
    date = datetime.utcnow().strftime('%a, %d %b %Y %H:%M:%S GMT')

    # sort and decode query
    query_string = unquote_plus('&'.join(sorted(query.split('&'))))

    id_string = "\n".join([accept, date, host, path, query_string]) + "\n"

    auth_string = build_auth_string(access_id, api_key, id_string)

    return {'Accept': accept,
            'x-summon-date': date,
            'Host': host,
            'Authorization': auth_string}


def build_auth_string(access_id, api_key, id_string):
    """
    Generates authentication string needed for Authorization header.

    :param access_id: Your Summon API Access ID
    :param api_key: Your Summon API Key
    :param id_string: string from build_headers combining query, etc.
    :returns: string "Summon your_access_id;base64_encoded_hash"
    """
    key = bytes(api_key, 'UTF-8')
    message = bytes(id_string, 'UTF-8')
    hashed_code = hmac.new(key,
                           message,
                           hashlib.sha1).digest()
    digest = base64.encodebytes(hashed_code).decode('UTF-8')

    auth_string = 'Summon {};{}'.format(access_id, digest)
    return auth_string.replace('\n', '')
