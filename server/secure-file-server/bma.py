# -*- coding: utf-8 -*-

import json

import os
import shutil
import uuid
import logging

# import bma_config as config
import ospackages as ospackages
import config
# You can use username/password or sessionID for authentication.
# Be sure to inform a valid and active sessionID.
import isoimages

# osActivitiesConfig = config.Activities()
# defaultConfig = config.DefaultConfig()


def init(hostname):
    try:
        # Set up cert directory and config directory if not present
        # directories = ['/usr/local/bma/conf', '/usr/local/bma/conf/certs']
        # for directory in directories:
        #     if not os.path.exists(directory):
        #         os.mkdir(directory)

        # Check for the default config files. Create new config with its default contents if file does not exists.
        # defaultConfigs = {
        #     'conf/ospackages.json': '[]',
        #     'conf/bma_settings.json': json.dumps({
        #         "ov_certs_path": "conf/certs",
        #         "temp_dir": "/tmp",
        #         "ks_basedir": "kickstarts",
        #         "http_server": "local",
        #         "local_http_root": defaultConfig.htmlPath,
        #         "http_file_server_url": "http://127.0.0.1/",
        #     }),
        #     'conf/settings.json': json.dumps({
        #         "logFilePath": "bma.log",
        #         "logLevel": "DEBUG",
        #         "language": "English (US)",
        #         "httpFileServer": "Local",
        #         "themeMode": "Dark",
        #         "deplQueueSize": 50,
        #         "mode": "Central"
        #     })
        # }
        # for configFile, defaultContent in defaultConfigs.items():
        #     if not os.path.exists(configFile):
        #         with open(configFile, 'w') as newFile:
        #             newFile.write(defaultContent)

        # config.BMASettings().set("http_file_server_url", "https://" + hostname + "/images/")
        # config.BMASettings().set("hostname", hostname)
        # config.BMASettings().set("http_file_server_url", "https://" + hostname + "/images/")

        #    fin = open('../config/ksfiles.json', 'r')
        #    global ksfiles_settings
        #    ksfiles_settings = json.load(fin)
        #    #print(ksfiles_settings)
        #    fin.close()

        #    fin = open('../config/ospackages.json', 'r')
        #    global ospackages_settings
        #    ospackages_settings = json.load(fin)
        #    print(ospackages_settings)
        #    fin.close()

        ospackages.init('/usr/local/bma/conf/ospackages.json', '/usr/local/bma/scripts/scripts.json')

    except Exception as err:
        logging.exception(err)
        raise err

def add_file(filename, type, path):
    print(f"Filename: {filename} type: {type} path: {path}")

    file_data = {"filename": filename, "type": type, "path": path, "url": config.SETTINGS['HTTP_FILE_SERVER_URL'] + path.lstrip(config.SETTINGS['LOCAL_HTTP_ROOT'])}

    if not os.path.exists("files.json"):
        with open("files.json", "w") as fp:
            json.dump({"data": [file_data]}, fp, indent=2)
    else:
        with open("files.json", "r") as fp:
            files_json = json.load(fp)
            print(files_json)

        with open("files.json", "w") as fp:
            files_json["data"].append(file_data)
            json.dump(files_json, fp, indent=2)


def get_files():
    with open("files.json", "r") as fp:
        files_json = json.load(fp)
        return files_json

def create_os_package(taskId, ospackagedata, orig_iso_path):
    """
    Create os package with modifications to enable kickstart.
    """

    try:
        logging.info("createOSPackage: Generating OS package for: ")
        logging.info(ospackagedata)

        ospackitem = json.loads('{ "uri": "", "package": "", "osType":  "", "ISO_http_path": "" }')

        ospackitem['uri'] = uuid.uuid4().hex
        ospackitem['package'] = ospackagedata['name']
        ospackitem['osType'] = ospackagedata['osType']
        ospackitem['source'] = ospackagedata['file']
        ospackitem['purpose'] = ospackagedata['imagePurpose']
        ospackitem['kickstartGeneration'] = ospackagedata['kickstartGeneration']
        ospackitem['syncStatus'] = 'Local'

        # target_dir = config.BMASettings().get("local_http_root")
        images_root = "/usr/share/nginx/html/images"
        target_dir = images_root

        host_os_distro = defaultConfig.hostDistroName

        logging.debug("###### Before calling geniso")

        if ospackitem['purpose'] in ['redfish', 'drivers']:
            result = isoimages.geniso(ospackitem['uri'], ospackagedata['osType'], orig_iso_path, target_dir, ospackitem['purpose'], host_os_distro, ospackitem['kickstartGeneration'])
        else:
            # Purpose is missing
            raise Exception("Image purpose not specified")


        logging.debug("###### After calling geniso")
        if 'targetISOPath' in result:
            target_iso_path = result['targetISOPath']
            task_manager = TaskManager.get_instance()
            # Update the task info with generated ISO file name
            task_manager.update_task_data(taskId, -1, {'filepath': os.path.basename(target_iso_path)})
            ospackitem['ISO_http_path'] = os.path.basename(target_iso_path)
            ospackages.setOSPackage(ospackitem)
            return {"result": ospackitem, "error": ""}

        return {"result": {}, "error": "Unsupported OS type"}
    except Exception as err:
        logging.exception(err)
        raise Exception from err


def getDashboardData():
    try:
        # ovcount = len(ov_appliances)

        total_storage, used_storage, free_storage = shutil.disk_usage('/')
        storage_stats = {
            "total": (total_storage // (2**30)),
            "free": (free_storage // (2**30)),
            "used": (total_storage // (2**30)) - (free_storage // (2**30))
        }

        ovcount = rm.getOVCount()
        osPackagesStats = ospackages.getOSPackagesStats()

        tasks = getAllTasks()

        return {"tasks": tasks, "storageStats": storage_stats, "rmStats": ovcount, "osPackages": osPackagesStats}
    except Exception as err:
        logging.exception(err)
        raise Exception from err


def getOSPackageById(packageId):
    try:
        return ospackages.getOSPackageById(packageId)
    except Exception as err:
        logging.exception(err)
        raise Exception from err


def deleteOSPackageById(packageId):
    try:
        hostOSdistro = defaultConfig.hostDistroName
        return ospackages.deleteOSPackageById(packageId, hostOSdistro)
    except Exception as err:
        logging.exception(err)
        raise Exception(str(err))




def getScripts(osType):
    return ospackages.getScripts(osType)


def getSupportedOSList():
    try:
        # return config.OSPackage().getSupportedOSList()
        return ospackages.getSupportedOSList()
    except Exception as err:
        logging.exception(err)
        raise Exception from err


def getAllTasks():
    try:
        # return osActivitiesConfig.getAllTasks()
        return TaskManager.get_instance().get_all_tasks()
    except Exception as err:
        logging.exception(err)
        raise Exception from err



def getURLforOSPackage(OSPackage):
    try:
        basehttpurl = config.BMASettings().get("http_file_server_url")

        ospackagedata = ospackages.get_os_package(OSPackage)

        if ospackagedata != {}:
            return basehttpurl + ospackagedata['ISO_http_path']
        else:
            return ""
    except Exception as err:
        logging.exception(err)
        raise Exception from err










def downloadKickstartFile(osType, scriptType, kickstartFile):
    return ospackages.downloadKickStartFile(osType, scriptType, kickstartFile)


def addLCEnv(data):
    logging.debug(f"addLCEnv: {data}")
    return {"result": "good"}


def updateTaskData(taskId, subtaskId, body):
    logging.debug(f"updateTaskData: {taskId} # {subtaskId} # {body}")
    taskmanager = TaskManager.get_instance()
    taskmanager.update_task_data(taskId, subtaskId, body)
    return None


def getImageSyncStatus():
    try:
        settings = getSettings()
        logging.debug(f"settings: {settings}")
        central = settings['central']

        images = ospackages.getImageSyncStatus(
            central['bmaCentralIP'],
            {"username": central["bmaCentralUsr"], "password": central["bmaCentralPwd"]}
        )

        logging.debug(f"Images with Sync status: {images}")
        return images

    except Exception as err:
        logging.exception(err)
        raise Exception from err


def getOSPackages(filter=None):
    try:
        return ospackages.getOSPackages(filter)
    except Exception as err:
        logging.exception(err)
        raise Exception from err




if __name__ == '__main__':

    print("main")
    #   ilocreds = {"user": "v241usradmin", "password": "HP!nvent123"}
    #  getILONetworkConnections("10.188.1.184", ilocreds )


    #taskID = createTask(3)
    # print("########################################")
    #print(TasksTable)
    #print("########################################")
    #setTaskStatus(taskID, 0, "Completed")

    init("10.188.210.14")

    #ovconfig = getOVConfig("syn0210")
    #oneview_client = oneviewConnect(ovconfig)
    #spdata = oneview_client.server_profiles.get_by_name("sp21")

    #OSConfigJSON = json.loads('{"mgmtNIC": {"connectionName": "vmnic0"}, "osDrive": {"driveName": "localosdrive"}, "networkName": "testnetwork", "netmask": "255.255.255.0", "vlan": "210", "gateway": "10.188.210.1", "dns1": "10.188.0.2", "dns2": "10.188.0.3", "ipAddr": "10.188.210.45", "bootProto": "static", "hostName": "host45", "serverProfile": "sp21", "osPackage": "VMware-ESXi-6.7.0-Update3-15160138-HPE-Gen9plus-670.U3.10.5.0.48-Dec2019.iso", "id": 0, "progress": 4, "status": "In-Progress", "startTime": ["2020-04-12T01:45:56.261634"], "message": "Created the server profile: sp45"}') 

    #replacedData = replaceWithSPData(oneview_client, OSConfigJSON, spdata) 
    #print("Replaced data: ")
    #print(replacedData)


    #genOVCert(ovdetails)

    #getOVSPTNetworkConnections("Synergy210", "SPT-ESXi")

    #createOSPackage({'name': 'esxi12', 'osType': 'SLES15'}, "/tmp/VMware-ESXi-6.7.0-9484548-HPE-Gen9plus-670.10.3.5.6-Sep2018.iso")
    #
    '''
    osInfo = {'name': 'SLES-test', 'osType': 'SLES15'}
    isoPath = "/tmp/SLE-15-Installer-DVD-x86_64-GM-DVD1.iso"
    print(f'create OS package for {osInfo} with {isoPath}')
    createOSPackage(osInfo, isoPath)

    osInfo = {'name': 'RHEL7-test', 'osType': 'RHEL7'}
    isoPath =  "/tmp/RHEL-7.8-20200225.1-Server-x86_64-dvd1.iso"
    isoPath =  "/tmp/RHEL-7.7-20190723.1-Server-x86_64-dvd1.iso"
    print(f'create OS package for {osInfo} with {isoPath}')
    createOSPackage(osInfo, isoPath)

    osInfo = {'name': 'esxi12', 'osType': 'ESXi6'}
    isoPath =  "/tmp/VMware-ESXi-6.7.0-9484548-HPE-Gen9plus-670.10.3.5.6-Sep2018.iso"
    print(f'create OS package for {osInfo} with {isoPath}')
    createOSPackage(osInfo, isoPath)

    createOSPackage({'name': 'esxi12', 'osType': 'SLES15'}, "/tmp/VMware-ESXi-6.7.0-9484548-HPE-Gen9plus-670.10.3.5.6-Sep2018.iso")
    createOSPackage({'name': 'RHEL_7.8', 'osType': 'RHEL7'}, "/tmp/RHEL-7.8-20200225.1-Server-x86_64-dvd1.iso")
    '''
    task_data = {"type": "IMAGE_IMPORT", "data": {"data": {'name': 'rhel-8.3-x86_64-dvd', 'osType': 'RHEL'}, "filepath": "/tmp/rhel-8.3-x86_64-dvd.iso"}}

    print(defaultConfig.htmlPath)



def syncImage(json):
    settings = getSettings()
    logging.debug(f"settings: {settings}")
    central = settings['central']

    return ospackages.syncImage(
        central['bmaCentralIP'],
        {"username": central["bmaCentralUsr"], "password": central["bmaCentralPwd"]},
        json['uri']
    )
