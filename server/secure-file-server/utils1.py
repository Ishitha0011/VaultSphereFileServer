
import logging
from ipaddress import ip_address

def ips(start, end):
    '''Return IPs in IPv4 range, inclusive.'''
    start_int = int(ip_address(start).packed.hex(), 16)
    end_int = int(ip_address(end).packed.hex(), 16)
    return [ip_address(ip).exploded for ip in range(start_int, end_int)]

# Compares 2 values which are either in units of GB or GiB
def matchGB_GiB(val1, val2):

    logging.info("matchGB_GiB: val1: {}".format(val1))
    logging.info("matchGB_GiB: val2: {}".format(val2))
    if type(val1) is str:
        val1 = float(val1)

    if type(val2) is str:
        val2 = float(val2)

    # When both input values are in same units
    if int(val1) == int(val2):
        logging.info("matchGB_GiB: matched 2 values without conversion")
        return True

    # If va11 is in GB and val2 is in GiB
    if int(val1) == int(val2 * 1024 * 1024 * 1024 / 1000 / 1000 / 1000 ):
        logging.info("matchGB_GiB: matched 2 values after conversion of val2")
        return True

    # If va12 is in GB and val1 is in GiB
    if int(val2) == int(val1 * 1024 * 1024 * 1024 / 1000 / 1000 / 1000 ):
        logging.info("matchGB_GiB: matched 2 values after conversion of val1")
        return True

    # When no match found
    logging.info("matchGB_GiB: not matched")
    return False


def stringMatch(str1, str2):

    if str1.lower().replace(" ", "") == str2.lower().replace(" ", ""):
        logging.info("stringMatch: matched")
        return True
    else:
        logging.info("stringMatch: not matched")
        return False


def bytesToGB(byteData):
    return byteData / 1024 / 1024 / 1000


if __name__ == '__main__':
    print("")
