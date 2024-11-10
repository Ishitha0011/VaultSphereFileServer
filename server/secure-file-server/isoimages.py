import logging
import time

import requests
import json


def geniso(uri, osType, isoPath, targetDir, purpose, hostOSdistro, kickstartGeneration):
    """

    kickstartGeneration - if True, the image will be modified to look for kickstart file from virtual USB device.
    Else the image will be untouched and assumes the image has embedded kickstart file for automated OS installation
    """

    request_json = {
        "uri": uri,
        "osType": osType,
        "isoPath": isoPath,
        "targetDir": targetDir,
        "purpose": purpose,
        "hostOSdistro": hostOSdistro,
        "kickstartGeneration": kickstartGeneration
    }

    logging.debug("geniso: {}".format(request_json))

    # REST call to bma_utils
    url = "http://localhost:5001/rest/geniso"
    headers = {'Accept': 'application/json', 'Content-Type': 'application/json'}
    response = requests.post(url, headers=headers, data=json.dumps(request_json))
    logging.debug(response)

    res = response.json()
    if 'error' in res and res['error'] != "":
        raise Exception("Failed to generate ISO image {}".format(res['error']))
    elif 'result' in res:
        return res['result']

def genisoEmbeddedKS(taskId, osType, isoPath, targetDir, ksFile, hostOSdistro):

    request_json = {
        "osType": osType,
        "isoPath": isoPath,
        "targetDir": targetDir,
        "hostOSdistro": hostOSdistro,
        "ksFile": ksFile
    }

    logging.debug("geniso: {}".format(request_json))

    # REST call to bma_utils
    url = f"http://localhost:5001/rest/gen_iso_embedded_ks/{taskId}"
    headers = {'Accept': 'application/json', 'Content-Type': 'application/json'}
    response = requests.post(url, headers=headers, data=json.dumps(request_json))
    logging.debug(response)

    task = response.json()
    logging.debug(f"res: {task}")

    generated_iso_filename = ""

    if 'status' in task and task['status'] == "In-Progress":
        # Poll for asynchronous task status every 10 secs for 300 secs
        count = 120
        while count > 0:
            count = count - 1
            res = requests.get(f"http://localhost:5001/rest/task/{taskId}", headers=headers)
            task_info = res.json()
            logging.debug(f"task info: {task_info}")
            if 'status' in task_info and task_info['status'] == "Completed":
                generated_iso_filename = task_info['filename']
                logging.debug(f"task completed for ISO {generated_iso_filename}")
                break
            else:
                # Wait for 10 seconds
                time.sleep(10)

    if generated_iso_filename == "":
        raise Exception(f"Failed to generate ISO image for task {taskId}")

    return generated_iso_filename


def cleanup(taskId, subtaskId):
    logging.debug("Cleanup the generated images")
    url = f"http://localhost:5001/rest/cleanup/{taskId}"
    headers = {'Accept': 'application/json', 'Content-Type': 'application/json'}
    response = requests.delete(url, headers=headers)
    logging.debug(response)

def extractISO(imagePath, targetDir):

    request_json = {
        "image_path": imagePath,
        "extract_dir": targetDir
    }

    logging.debug("extractISO: {}".format(request_json))

    # REST call to bma_utils
    url = "http://localhost:5001/rest/extractiso"
    headers = {'Accept': 'application/json', 'Content-Type': 'application/json'}
    response = requests.post(url, headers=headers, data=json.dumps(request_json))
    logging.debug(response)

    res = response.json()
    if res['status'] != "success":
        raise Exception("Failed to generate ISO image {}".format(res))


if __name__ == '__main__':
    print("")