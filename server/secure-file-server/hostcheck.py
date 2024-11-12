# -*- coding: utf-8 -*-

import socket
import time
import logging

# This function keep checking if the server is up for 30 mins and 
# if detects server UP then returns True
# if server UP cannot be detected for 30 mins then return False
def test_ip_connection(ip, os_type):
    """
    Tests if IP address is connectable.
    The type of test depends on the OS type.
    """

    count = 0
    # Default port to check for OS completion
    port = 22

    logging.info("isOpen: Wait 150 seconds for OS installation")
    time.sleep(150)

    if os_type.startswith("ESX") == True:
        # For ESXi hosts check for the port for HTTPS used by VSphere clients
        port = 443
    elif os_type.startswith("RHEL") == True:
        # For Linux hosts check for SSH port
        port = 22
    elif os_type.startswith("UBUNTU") == True:
        # For Linux hosts check for SSH port
        port = 22
    elif os_type.startswith("SLES") == True:
        # For SUSE Linux hosts check for SSH port
        port = 22

    retVal = False
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    while count < 165:
       count = count + 1
       logging.debug("Pinging the host with IP: " + ip)
       try:
          s.connect((ip, int(port)))
          s.shutdown(2)
          retVal = True
          logging.info("IP {addr} is reachable".format(addr=ip))
          break
       except:
          retVal = False
          time.sleep(10)

    return retVal


if __name__ == '__main__':

#    print (isOpen('10.188.175.22', "ESX"))

    print (test_ip_connection('10.188.210.24', "RHEL"))
