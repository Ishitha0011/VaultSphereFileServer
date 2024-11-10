# -*- coding: utf-8 -*-
###
# Copyright 2021 RedefinIT Technologies
#
import hmac
import os
import json
import mimetypes

# import flask
from flask import Flask, request, jsonify, send_file, abort
from flask_cors import CORS
# from flask_jwt import JWT, jwt_required, current_identity
# from werkzeug.security import safe_str_cmp
# import re

import config

# TODO this is not best option for production
from werkzeug.utils import secure_filename

import logging
from logging.handlers import RotatingFileHandler
import datetime

import bma as bma
import configparser as parse
import version
from uuid import uuid4

ALLOWED_EXTENSIONS = set(['txt', 'csv', 'xls', 'xlsx', 'pdf', 'iso', 'ISO', 'zip', 'ZIP', 'tar', 'TAR', 'gz', 'GZ'])

# Create a dictionary to map MIME types to human-readable file types
MIME_TYPE_MAP = {
    'application/pdf': 'PDF',
    'application/vnd.ms-excel': 'XLS',  
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX', 
    'text/plain': 'TXT', 
    'application/zip': 'ZIP',  
    'application/x-tar': 'TAR', 
    'application/gzip': 'GZ',  
    'application/octet-stream': 'ISO',  
    'image/jpeg': 'JPEG',
    'image/png': 'PNG',
    'application/json': 'JSON',
    'text/csv': 'CSV',  
}

class User(object):
    def __init__(self, userId, username, password):
        self.id = userId
        self.username = username
        self.password = password

    def __str__(self):
        return "User(='%s')" % self.id


users = [
    User(1, 'admin', 'admin'),
    User(2, 'govind', 'Welcome#123'),
]

username_table = {u.username: u for u in users}
userid_table = {u.id: u for u in users}


def authenticate(username, password):
    logging.debug("authenticate: username: ", username)
    user = username_table.get(username, None)
    if user and hmac.compare_digest(user.password.encode('utf-8'), password.encode('utf-8')):
        return user


def identity(payload):
    logging.debug("identity: payload: ", payload)
    user_id = payload['identity']
    return userid_table.get(user_id, None)

LOGGING_LEVEL = {
    'INFO': logging.INFO,
    'WARNING': logging.WARNING,
    'ERROR': logging.ERROR,
    'DEBUG': logging.DEBUG,
}


def get_readable_file_type(mime_type):
    """
    Converts a MIME type into a human-readable file type.
    """
    return MIME_TYPE_MAP.get(mime_type, 'Unknown File Type')

def getAppConfig(path):
    config_path = path + "/etc"
    log_path = path + "/logs"

    config_file = os.path.join(config_path, 'config.ini')

    defaults = {
        'port': "5000",
        'log_path': log_path,
        'log_level': "INFO"
    }

    conf = parse.ConfigParser(defaults=defaults)
    conf.read(config_file)

    server = conf.get('DEFAULT', 'server').strip(' \'"')
    port = conf.get('DEFAULT', 'port')
    log_path = conf.get('logging', 'log_path')
    log_level = conf.get('logging', 'log_level')

    if not port:
        port = defaults.get('port')

    if not log_path:
        log_path = defaults.get('log_path')

    if not log_level:
        log_level = defaults.get('log_level')

    port = int(port)

    app_config1 = {
        'server': server,
        'port': port,
        'logPath': log_path,
        'logLevel': log_level
    }

    return app_config1


def start(app, app_home_path):
    # app_config = getAppConfig(app_home_path)

    # print("start: ")
    # print(app_config)
    try:
        ipaddr = config.SETTINGS['PORT']
        port = config.SETTINGS['PORT']

        logFile = os.path.join('fileserver.log')

        print(logFile)

        logggingFormat = '%(asctime)s %(process)d-%(thread)d %(levelname)s [%(filename)s:%(lineno)d] %(message)s'
        # ,datefmt='%Y-%m-%d %H:%M:%S'

        fh = RotatingFileHandler(logFile, maxBytes=10 * 1024 * 1024, backupCount=2)
        logging.basicConfig(
            level=config.SETTINGS['LOG_LEVEL'],
            format=logggingFormat,
            handlers=[fh, logging.StreamHandler()])
        app.config['UPLOAD_FOLDER'] = config.SETTINGS['UPLOAD_FOLDER']
        app.secret_key = "secret key"

        # set max length of file that can be uploaded to 20 GB
        app.config['MAX_CONTENT_LENGTH'] = 20000 * 1024 * 1024
        # logging.debug("{} : {} : {} : {}".format(ipaddr, port, logPath, logLevel))
        # logging.debug("Server IP: " + ipaddr)
        # logging.info("Starting REST server at http://{}:{}/".format(ipaddr, port))
        # this is from bma.py
        bma.init(ipaddr)
        # app.run(debug=True, host=LOCALHOST)
        # app.run(ssl_context="adhoc",debug=True, host=ipaddr)
        # app.run(debug=True, host=ipaddr)
        # app.run(debug=True, host=ipaddr, ssl_context='adhoc')

        return ipaddr

    except Exception as err:
        logging.exception(err, exc_info=True)


def create_app():
    app = Flask(__name__)
    # CORS(app)
    CORS(app, origins='*')

    app.debug = True
    # app.config['SECRET_KEY'] = 'super-secret'
    app.config['SECRET_KEY'] = uuid4().hex
    app.config['JWT_EXPIRATION_DELTA'] = datetime.timedelta(days=2)
    # jwt = JWT(app, authenticate, identity)

    ip_address = start(app, "/usr/local/bma")

    ###############################################################################


    @app.route('/rest/version', methods=['GET'])
    def getVersion():
        print("Get Version")
        logging.debug("getVersion")
        return jsonify({"version": version.getVersion()})

    @app.route('/rest/sessions', methods=['GET', 'POST'])
    # @jwt_required()
    def sessions():
        try:
            logging.debug("Sessions.............")

            identity = current_identity()
            logging.debug(current_identity)
            logging.debug(current_identity.id)

            response1 = {
                'isAuthenticated': True
            }
            return jsonify(response1)

        except Exception as err:
            logging.exception(err)
            return jsonify({"result": {}, 'error': err})

    @app.route('/rest/sessions/<token>', methods=['GET', 'DELETE'])
    # @jwt_required()
    def session_delete(token):
        if request.method == 'DELETE':
            try:
                logging.debug("Sessions.............")
                logging.debug(token)
                # This is for session logout request
                logging.debug("Logout Successful!")

            except Exception as err:
                logging.exception(err)
                return jsonify({"result": {}, 'error': err})
        elif request.method == 'GET':
            response1 = {
                'user': "default_user",
                'userName': "Govind",
                'token': token,
                'isAuthenticated': True
            }
            return jsonify(response1)

    ####################### START OF Settings APIs #################
    @app.route('/rest/settings', methods=['GET', 'POST'])
    # @jwt_required()
    def settings():
        try:
            if request.method == 'GET':
                response = bma.getSettings()
                return jsonify({"result": response, 'error': {}})

            elif request.method == "POST":
                logging.debug("Settings: {}".format(request.json))
                response = bma.setSettings(request.json)
                return jsonify({"result": response, 'error': {}})

        except Exception as err:
            logging.exception(err)
            return jsonify({"result": {}, 'error': {'msg': err}})

    @app.route('/rest/supportdump', methods=['GET'])
    # @jwt_required()
    def getSupporDump():
        try:
            logging.debug("getSupporDump: ")
            return jsonify({"result": {}, "error": {}})
        except Exception as err:
            logging.exception(err)
            return jsonify({"result": {}, 'error': err})
    ####################### END OF Settings APIs #################

    @app.route('/rest/dashboard', methods=['GET'])
    # @jwt_required()
    def getDashboardData():
        try:
            dashboardData = bma.getDashboardData()
            logging.debug("getDashboardData: ")
            # logging.debug(dashboardData)
            return jsonify({"result": dashboardData, "error": {}})
        except Exception as err:
            logging.exception(err)
            return jsonify({"result": {}, 'error': err})



    ################ START OF OS packages and firmware bundles API ######################
    @app.route('/rest/images/list', methods=['GET'])
    # @jwt_required()
    def getOSPackages():
        try:
            logging.debug(request)
            logging.debug("get ospackage list: ")
            # the URL query params ?ostype=ESXi7
            # the URL query params ?purpose=redfish
            # if no query parameter found then returns all kickstarts grouped by OS types
            osType = request.args.get('ostype', '')
            purpose = request.args.get('purpose', '')

            logging.debug(f"Filters osType: {osType}, purpose: {purpose}")

            ospackages = bma.getOSPackages({'osType': osType, 'purpose': purpose})

            logging.debug(ospackages)
            # return jsonify(ospackages)
            return jsonify({"result": ospackages, "error": {}})
        except Exception as err:
            logging.exception(err)
            return jsonify({"result": {}, 'error': err})

    @app.route('/rest/images/sync', methods=['POST'])
    # @jwt_required()
    def syncImage():
        logging.debug(f'Request on OS package {request.json}')
        ret = bma.syncImage(request.json)
        return jsonify({"result": ret, "error": {}})

    @app.route('/rest/images/<id>', methods=['GET', 'DELETE'])
    # @jwt_required()
    def OSPackageById(id):
        try:
            logging.debug(f'Request on OS package {id}')
            if request.method == 'DELETE':
                logging.debug(f'DELETE OS package id {id}')
                rc = bma.deleteOSPackageById(id)
                return jsonify({"result": rc, "error": {}})
            elif request.method == 'GET':
                logging.debug(f'GET OS package id {id}')
                ospackage = bma.getOSPackageById(id)
                logging.debug(ospackage)
                return jsonify({"result": ospackage, "error": {}})
            else:
                raise Exception(f'{request.method} is not supported')
        except Exception as err:
            logging.error(f'route error: {err}')
            return jsonify({"result": "Fail", 'error': str(err)})

    @app.route('/rest/ostype/list', methods=['GET'])
    # @jwt_required()
    def getSupportedOSList():
        try:
            supportedOSList = bma.getSupportedOSList()
            logging.debug("getSupportedOSList: ")
            logging.debug(supportedOSList)
            # return jsonify(supportedOSList)
            return jsonify({"result": supportedOSList, "error": {}})
        except Exception as err:
            logging.exception(err)
            return jsonify({"result": {}, 'error': err})

    # This is common API for fetching a list of items using category as input
    # Need to add additional query and filter params to allow user to search
    # using keywords and filter by additional params
    @app.route('/rest/files/<category>', methods=['GET'])
    # @jwt_required()
    def getFiles(category):
        try:
            logging.debug("getFiles: ")
            items = bma.get_files()
            logging.debug(f"items: {items}")
            result = {"category": category, "data": items["data"]}
            return jsonify({"result": result, "error": {}})
        except Exception as err:
            logging.exception(err)
            return jsonify({"result": {}, 'error': err})


    @app.route('/rest/upload', methods=['POST'])
    # @jwt_required()
    def upload():
        try:
            logging.info("HTTP Upload for uploading OS ISOs and other files")
            logging.info("&&&&&&&&&")

            # The form-data should include OS package meta data like data={'ospackage': 'ESXi6.5_1', 'ostype': 'ESXi'}

            if request.method == 'POST':
                logging.info("POST....")

                logging.debug("upload: request: ")
                logging.debug(request.headers)
                # data = json.loads(request.form.get('data'))
                # logging.debug("upload: data: " + str(data))

                # check if the post request has the file part
                if 'file' not in request.files:
                    logging.warning("No file part...")
                    # flash('No file part')
                    return {"result": {}, "error": "No file part found in POST request"}
                file = request.files['file']
                logging.debug("File is: ")
                logging.debug(file)
                # if user does not select file, browser also
                # submit an empty part without filename
                if file.filename == '':
                    logging.info("No selected file...")
                    # flash('No selected file')
                    return {"result": {}, "error": "No input file found"}
                if file and allowed_file(file.filename):
                    logging.info("Saving the file...")

                    filename = secure_filename(file.filename)
                    # Target path for the uploading file
                    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)

                    data = json.loads(request.form.get('data'))
                    logging.debug("upload: data: " + str(data))

                    # Save the file
                    logging.info("Saving the file to: " + str(filepath))
                    file.save(filepath)


                    # This function is from bma.py
                    # retval = bma.createOSPackage(data, filepath)
                    # logging.info("createOSPackage returned: " + str(retval))
                    return jsonify({"result": "success", "error": ""})
                    # return redirect(url_for('upload', filename=filename))

            return '''
            <!doctype html>
            <title>Upload new File</title>
            <h1>Upload new File</h1>
            <form method=post enctype=multipart/form-data>
            <input type=file name=file>
            <input type=submit value=Upload>
            </form>
            '''
        except Exception as err:
            logging.exception(err)
            return jsonify({"result": {}, 'error': err})

    @app.route('/rest/uploadchunks', methods=['POST'])
    # @jwt_required()
    def uploadchunks():

        print("uploadchunks")
        try:
            # logging.info(f"HTTP Upload for uploading large files in chunks, uploadId:")

            # The form-data should include OS package meta data like data={'ospackage': 'ESXi6.5_1', 'ostype': 'ESXi'}

            if request.method == 'POST':
                # logging.debug("upload: request: ")
                # logging.debug(request.headers)

                data = json.loads(request.headers['data'])
                print(f"\n\nData: {data} \n\n")
                progress = json.loads(request.headers['progress'])
                print(f"Progress: {progress}")

                filename = secure_filename(data['file'])
                filetype = data['type']

                def mime_to_file_type(mime_type):
                    # Split the MIME type and get the second part, then capitalize it
                    return mime_type.split('/')[1].upper()

                readable_file_type = get_readable_file_type(filetype)
                print(f"\n\n\nUploading {filename} with file type: {readable_file_type}\n\n\n")

                print(filename)
                print(app.config['UPLOAD_FOLDER'])
                if filename and allowed_file(filename):
                    raw_data = request.get_data()
                    filename = secure_filename(filename)

                    # Target path for the uploading file
                    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)

                    # Create the directory if it doesn't exist:
                    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

                    # Save the file
                    logging.info("Saving the file to: " + str(filepath))

                    if progress['start'] == 0:
                        # This must be the first block

                        # If first block then dont open in append mode.
                        # If a file already exists it will be overwritten
                        # Create the task for upload tracking
                        # task_data = {"type": "IMAGE_IMPORT", "data": {"data": data, "filepath": filepath}}
                        # task = bma.createTask("IMAGE_IMPORT", task_data)
                        # logging.debug(f"importImage: task_data: {task_data}")
                        with open(filepath, 'wb') as f:
                            f.write(raw_data)
                            f.close()

                        if(progress['end'] == progress['size']):
                            bma.add_file(filename, readable_file_type, filepath)

                    elif progress['end'] == progress['size']:
                        logging.debug(f"ENDDDDD...... {filepath}")
                        with open(filepath, 'ab') as f:
                            # f.seek(progress['start'])
                            f.write(raw_data)
                            f.close()

                        bma.add_file(filename, readable_file_type, filepath)

                        # data = json.loads(request.form.get('data'))
                        logging.debug("upload: data: " + str(data))

                    else:
                        # Append the chunks
                        with open(filepath, 'ab') as f:
                            # f.seek(progress['start'])
                            f.write(raw_data)
                            f.close()

                # This function is from bma.py
                # retval = bma.createOSPackage(data, filepath)
                # logging.info("createOSPackage returned: " + str(retval))
                logging.info(f"uploadchunks: Exiting for {progress}")
                return jsonify({"result": {'data': progress}, "error": {}})
                # return redirect(url_for('upload', filename=filename))

            return '''
            <!doctype html>
            <title>Upload new File</title>
            <h1>Upload new File</h1>
            <form method=post enctype=multipart/form-data>
            <input type=file name=file>
            <input type=submit value=Upload>
            </form>
            '''
        except Exception as err:
            logging.exception(err)
            return jsonify({"result": {}, 'error': err})

    ################ END OF OS packages and firmware bundles API ######################

    ################ START OF Scripts ######################
    @app.route('/rest/scripts/list', methods=['GET'])
    # @jwt_required()
    def getScripts():
        try:
            logging.info("getScripts ")
            # the URL query params ?ostype=ESXi7
            # if no query parameter found then returns all kickstarts grouped by OS types
            osType = request.args.get('ostype', '')
            # the URL query params ?type=kickstart  or ?type=firstboot
            # if no query parameter found then returns all kickstarts grouped by OS types
            # type = request.args.get('type', '')

            kickstarts = bma.getScripts(osType)
            logging.debug(kickstarts)
        except Exception as err:
            logging.exception(err)
            return jsonify({"result": {}, 'error': err})

        return jsonify({"result": kickstarts, 'error': ""})


    @app.route('/rest/scripts/file/<osType>', methods=['GET'])
    # @jwt_required()
    def downloadScript(osType):
        try:
            logging.info("downloadScript ")
            # the URL query params ?file=ks.cfg
            # if no query parameter found then returns all kickstarts grouped by OS types
            script_file = request.args.get('file', '')
            script_type = request.args.get('type', '')
            logging.debug(f"script_file: {script_file} script_type: {script_type} osType: {osType}")

            file_path = bma.downloadKickstartFile(osType, script_type, script_file)
            logging.debug(file_path)
            resp = send_file(file_path, mimetype="text/plain")
            return resp

        except Exception as err:
            logging.exception(err)
            abort(404)
    ################ END OF Scripts ######################



    @app.errorhandler(404)
    def page_not_found(e):
        try:
            return jsonify({'result': 'Page Not Found'})
        except Exception as err:
            logging.exception(err)
            raise Exception from err

    def allowed_file(filename):
        try:
            return '.' in filename and \
                   filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
        except Exception as err:
            logging.exception(err)
            raise Exception from err


    ###############################################################################

    return app


if __name__ == '__main__':
    userConfig = {
        'server': "127.0.0.1",
        'port': 5000,
        'logPath': "logs",
        'logLevel': "INFO"
    }

    print("#################START")

    application = create_app()
    application.run(debug=True, host='0.0.0.0', port="3041")
