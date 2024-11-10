DEFAULT = {
    'HOST': '0.0.0.0',
    'PORT': '5001',
    'UPLOAD_FOLDER': "./data",
    'LOG_LEVEL': 'DEBUG',
    "HTTP_FILE_SERVER_URL": "http://127.0.0.1/images/",
    "LOCAL_HTTP_ROOT": "./data",
}

import os
import sys
import logging

SETTINGS = DEFAULT


def get_config_param(key):
    try:
        return os.environ[key]
    except KeyError:
        # logging.info(f"The environment variable {key} not set not found.\
        #              Setting {key} with default Value")
        return DEFAULT[key]


def read_config():
    for key in DEFAULT:
        SETTINGS[key] = get_config_param(key)
        # print(f'The env varaible read from API is {DEFAULT[key]}')
        # print(f'===================================')

# readConfig()