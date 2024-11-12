# -*- coding: utf-8 -*-


import json
# import bma_config as config
import config
import logging
import os
import requests

# g_osPackagesSettings = []
g_osPackagesFilePath = ""
# Points to /usr/local/bma/scripts/scripts.json
g_scriptsJSON = ""
g_htmlPath = ''


def init(osPackagesFilePath, scriptsJSON):
    """
    osPackagesFilePath - JSON file with list of OS images present in the Images repository
    scriptsJSON - JSON file containing list of supported OS's and path to OS scripts
    """

    global g_osPackagesFilePath
    g_osPackagesFilePath = osPackagesFilePath
    global g_scriptsJSON
    g_scriptsJSON = scriptsJSON

    # fin = open(g_osPackagesFilePath, 'r')
    # global g_osPackagesSettings
    #
    # g_osPackagesSettings = json.load(fin)
    # #print(g_ospackages_settings)
    # fin.close()

    # defaultConfig = config.DefaultConfig()
    global g_htmlPath
    g_htmlPath = config.SETTINGS['HTTP_FILE_SERVER_URL']


def getSupportedOSList():
    """
    Returns list of supported files as per /usr/local/bma/scripts/scripts.json file
    """

    ks_files = getScriptsConfig()

    os_list = []
    for ksFile in ks_files:
        os_list.append(ksFile['osType'])

    return os_list


def getOSPackageById(packageId):

    logging.debug("getOSPackage")
    global g_osPackagesFilePath

    try:
        with open(g_osPackagesFilePath, 'r') as fin:
            os_packages = json.load(fin)
    except Exception as ex:
        raise ex


    for package in os_packages:
        logging.debug(package)
        if package['uri'] == packageId:
            return package

    return []


def deleteOSPackageById(packageId, osDistro):
    '''
    Delete OS package in g_ospackages_settings by id.
    Remove ISO referenced by ISO_http_path
    '''
    logging.debug('deleteOSPackageById')
    global g_osPackagesFilePath
    try:
        with open(g_osPackagesFilePath, 'r') as fin:
            os_packages = json.load(fin)
    except Exception as ex:
        raise ex

    global g_htmlPath
    try:
        index = None
        logging.debug(f'id: {packageId}')
        for i, entry in enumerate(os_packages):
            logging.debug(entry)
            logging.debug(f'i: {i} entry["uri"]: {entry["uri"]}')
            if entry['uri'] == packageId:
                index = i
                break
        if index == None:
            logging.error(f'{packageId} not found')
            raise Exception(f'OS package id {packageId} not found in OS package settings')
        else:
            isoName = os_packages[index]['ISO_http_path']
            logging.debug(f'Delete ISO {g_htmlPath}{isoName}')
            # Attempt to remove the file only if exists
            if os.path.exists(f'{g_htmlPath}{isoName}'):
                os.remove(f'{g_htmlPath}{isoName}')
            logging.debug(f'Delete OS id {packageId}')
            del os_packages[index]
            index = None
            osConfigJson = g_osPackagesFilePath
            with open(osConfigJson,'w') as f:
                f.write(json.dumps(os_packages, indent=2))
            return 'Success'
    except Exception as err:
        logging.error(err)
        raise Exception(str(err))


def mergeItems(local_images, remote_images):

    merged_items = []
    merged_table = dict()

    for local_item in local_images:
        merged_table[local_item['uri']] = local_item

    for remote_item in remote_images:
        if remote_item['uri'] in merged_table:
            item = merged_table[remote_item['uri']]
            # item['syncStatus'] = "In-Sync"
        else:
            remote_item['syncStatus'] = "Not-Sync"
            merged_table[remote_item['uri']] = remote_item

    return list(merged_table.values())


def syncImage(bmaCentralIP, creds, imageUri):

    package = getOSPackageById(imageUri)
    logging.debug(f"syncImage: {package}")

    # Change the syncStatus to Syncing before importing
    package['syncStatus'] = 'Syncing'
    setOSPackage(package)

    image_url = "https://" + bmaCentralIP + "/images/" + package['ISO_http_path']
    # REST call to bma_utils
    url = "http://localhost:5001/rest/importImage"
    headers = {'Accept': 'application/json', 'Content-Type': 'application/json'}
    response = requests.post(url, headers=headers, data=json.dumps({'imageUrl': image_url, 'httpPath': package['ISO_http_path']}))
    logging.debug(response)
    task = response.json()
    logging.debug(f"res: {task}")
    return None

def getImageSyncStatus(bmaCentralIP, creds):
    logging.debug(f"getImageSyncStatus: {bmaCentralIP} creds: {creds}")


    login_url = "https://" + bmaCentralIP + "/auth"
    url = "https://" + bmaCentralIP + "/rest/list/images"
    headers = {'Accept': 'application/json', 'Content-Type': 'application/json'}

    try:
        local_images = getOSPackages()
        logging.debug(f"Local Images: {local_images}")

        response = requests.post(url=login_url, headers=headers, verify=False, data=json.dumps(creds))
        logging.debug(f"Login response is {response}")
        session = response.json()
        logging.debug(f"Login response is {session}")
        headers['Authorization'] = "JWT " + session['access_token']
        response = requests.get(url, headers=headers, verify=False)
        logging.debug(f"Response is {response.json()}")
        data = response.json()
        logging.debug(f"Remote Images: {data}")
        remote_images = data['result']['result']

        updated_images = mergeItems(local_images, remote_images)
        setOSPackages(updated_images)
        return updated_images
    except Exception as ex:
        logging.debug(ex)
        return []


def getOSPackages(filter=None):

    logging.debug(f"getOSPackages: {filter}")

    global g_osPackagesFilePath
    try:
        with open(g_osPackagesFilePath, 'r') as fin:
            os_packages = json.load(fin)

        output = []
        if filter:
            # TODO: Change the loops to work in all combinations of filters
            if filter['osType'] == "" and filter['purpose'] == "":
                # Nothing to filter so return all
                output = os_packages
            else:
                # Filter on osType first
                for package in os_packages:
                    if filter['osType'] == "":
                        logging.debug("OS Type filter passed, go to next!")
                    elif 'osType' in package and filter['osType'] == package['osType']:
                        logging.debug("OS Type filter passed, go to next!")
                    else:
                        # the item filtered out
                        continue

                    if filter['purpose'] == "":
                        logging.debug("Purpose filter passed, go to next!")
                    elif 'purpose' in package and filter['purpose'] == package['purpose']:
                        logging.debug("Purpose filter passed, go to next!")
                    else:
                        # the item filtered out
                        continue

                    # If here then the item passed filter criterion
                    output.append(package)
        else:
            output = os_packages

        return output
    except Exception as err:
        logging.exception(err)
        raise Exception(err)


def getOSPackagesStats():
    global g_osPackagesFilePath

    try:
        with open(g_osPackagesFilePath, 'r') as fin:
            os_packages = json.load(fin)
    except Exception as ex:
        raise ex

    total = len(os_packages)

    stats = dict()

    for package in os_packages:
        logging.debug(package)
        if package['osType'] in stats:
            stats[package['osType']] += 1 
        else:
            stats[package['osType']] = 1
    statsJSON = []
    for key in stats.keys():
        statsJSON.append({ "osType": key, "count": stats[key]})

    return ({ "total": total, "stats": statsJSON})
        

def get_os_package(ospackagename):
    logging.info("getOSPackage: ospackagename: " + ospackagename)
    global g_osPackagesFilePath
    try:
        with open(g_osPackagesFilePath, 'r') as fin:
            os_packages = json.load(fin)
    except Exception as ex:
        raise ex

    ospackage = {}
    for ospack in os_packages:
        if ospack['package'] == ospackagename:
            ospackage = ospack
            break

    logging.info("#################### " + json.dumps(ospackage))
    if ospackage == {}:
        logging.error("The requested OS package is not found for: " + ospackagename)
        err = ("Invalid or unknown OS package -" + ospackagename + " specified. Cannot proceed")
        raise Exception(err)

    return ospackage


def setOSPackage(ospackagedata):

    logging.debug("setOSPackage: ")
    logging.debug(ospackagedata)
    global g_osPackagesFilePath

    try:
        with open(g_osPackagesFilePath, 'r') as fin:
            os_packages = json.load(fin)
    except Exception as ex:
        raise ex

    os_packages.append(ospackagedata)
    logging.debug("ospackages: ")
    logging.debug(os_packages)

    fout = open(g_osPackagesFilePath, 'w')
    json.dump(os_packages, fout, indent=2)
    fout.close()

def setOSPackages(osPackages):

    logging.debug(f"setOSPackages: {osPackages}")
    global g_osPackagesFilePath

    fout = open(g_osPackagesFilePath, 'w')
    json.dump(osPackages, fout, indent=2)
    fout.close()


def getScriptsConfig():
    global g_scriptsJSON

    print(g_scriptsJSON)
   
    fin = open(g_scriptsJSON, 'r')
    ksFiles = json.load(fin)
    # print(ksFiles)
    fin.close()

    return ksFiles

def get_os_script_config(osType):
    """
    Gets the details of OS specific scripts location
    Returns value like:   {"osType": "ESXi", "path": "/usr/local/bma/scripts/esxi/"}

    """
    global g_scriptsJSON

    fin = open(g_scriptsJSON, 'r')
    ksFiles = json.load(fin)
    # print(ksFiles)
    fin.close()

    result = None

    for item in ksFiles:
        if item['osType'] == osType:
            result = item
            break

    return result


# type can be 'kickstart' or 'firstboot'
# if type=None then return all type of available scripts for specified osType
def getScripts(osType=None):
    logging.info("getScripts osType: " + osType)

    # Expect no scripts for some image types here
    if osType in ["Firmware_Bundle"]:
        return []

    #supportedOSes = getSupportedOSList()

    scripts_paths = getScriptsConfig()

    result = []

    for os1 in scripts_paths:
        if osType is None or osType == "" or os1['osType'] == osType:
            logging.debug(os1)
            base_ks_file = os.path.join(os1['path'], "kickstart")
            kickstart_files = os.listdir(base_ks_file)
            base_ks_file = os.path.join(os1['path'], "firstboot")
            firstboot_files = os.listdir(base_ks_file)

            result.append({'osType': os1['osType'], 'basePath': os1['path'], 'kickStarts': kickstart_files, 'firstBoot': firstboot_files})

    return result


# Returns the file object for the specified kickstart
# If failed Exception will be thrown
def downloadKickStartFile(osType, scriptType, name):

    logging.debug("downloadKickStartFile: %s-%s-%s", scriptType, osType, name)

    scripts_paths = getScriptsConfig()

    kickstart_file_path = ""
    for os1 in scripts_paths:
        logging.debug(os1)
        # base_ks_path = os.path.dirname(os1['path'])
        if os1['osType'] == osType:
            kickstart_file_path = os.path.join(os1['path'], scriptType, name)
            break
    logging.debug(kickstart_file_path)

    if kickstart_file_path == "":
        logging.debug(f"Invalid OS type {osType} and {name}")
        raise Exception(f"Invalid OS type {osType} and {name}")

    if not os.path.exists(kickstart_file_path):
        logging.debug(f"File not found for the specified kickstart {osType} and {name}")
        raise Exception(f"File not found for the specified kickstart {osType} and {name}")

    logging.info("downloadKickStartFile: Returning kickstart file %s", kickstart_file_path)
    return open(kickstart_file_path, 'r')


if __name__ == '__main__':

    import sys
    logging.basicConfig(stream=sys.stdout, level=logging.DEBUG)

    osPackagesFilePath = '/usr/local/bma/conf/ospackages.json'
    ksFilesPath = '/usr/local/bma/kickstarts/ksfiles.json'
    init(osPackagesFilePath, ksFilesPath)
    list21 = getImageSyncStatus("192.168.1.65", {"username": "admin", "password": "admin"})
    print(list21)

    # fout = downloadKickStartFile("ESXi7", "ks.cfg")
    # print(fout.read())
    # fout.close()



    # package = getOSPackage("junkos")
    # print(package)


