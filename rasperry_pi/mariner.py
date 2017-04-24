import serial
import logging
import threading
import time
import math
import pymongo
import datetime
import socket
from pymongo import MongoClient

RECONNECTING_TIME = 5
PORT = '/dev/ttyUSB0'
BAUDRATE = 9600

HOST = "www.google.com"
#TODO: Remember to multiply by 60
TIME_SLICE = 5
TIME_SLICE_UPDATE = 5

#Sensor letters
LIGHT_SENSOR = "light"
TEMP_SENSOR = "temperature"
BAT_SENSOR = "battery"

#Sensor range
#Values are in F
TEMP_MIN_VALUE = -25
TEMP_MAX_VALUE = 105

#Values are in  nits
LIGHT_MIN_VALUE = 100
LIGHT_MAN_VALUE = 700

#DB data
DB_ADDR = "localhost"
DB_REMOTE_ADDR = "ds025239.mlab.com"
DB_PORT = 27017
DB_REMOTE_PORT = 25239
DB_NAME = "events_db"

def hasInternet():
	"""	
		Checks if the system is connected to internet

	"""
	try:
		host = socket.gethostbyname(HOST)
		s = socket.create_connection((host,80), 2)
		logging.info("System Connected to Internet")
		return True
	except:
		logging.info("System Connected to Internet")
	return False

def connectDBMLAB(addr, port, user, password):
	try:
		client =  MongoClient(addr, port)
		db = client[DB_NAME]
		db.authenticate(user,password, mechanism="SCRAM-SHA-1")
		logging.info("Connected To MLAB")
		return db
		
	except Exception as e:
		logging.error("Error connecting MLAB\n" + str(e))
		return

	
def connectDB(addr, port):
	try:
		client =  MongoClient(addr, port)
		db = client[DB_NAME]
		logging.info("Connected to Local Database")
		return db
	except:
		logging.error("Error Connecting to Local Database")
		return
 
def openSerialConnection(port, baudrate):
	"""
		Open serial connection	
	"""
	try:
		conn = serial.Serial(port,baudrate)
		logging.info("Serial Connection Stablished")
		return conn
	except:
		logging.error("Serial Connection Failed")
		return 

def checkConnection(conn, port, baudrate):
	"""
		Check Serial connection

		If the serial connection is not openned it retry until it gets connected	
	"""
	if conn.isOpen() == False:
		logging.warning("Serial Connection Down. Reconnecting ...")
		conn = openSerialConnection(port, baudrate)
		
		if not conn:
			logging.error("Connection Failed to Database")
			
			for i in range [0,RECONNECTING_TIME]:
				time.sleep(1)
				logging.info("Reconnecting in" + str(RECONNECTING_TIME - i))
			checkConnection(conn, port, baudrate)
		else:
			return conn
	else:
		logging.info("Serial Connection Openned")
		return conn
		
			 


def getData(conn):
	"""
		Gets data from the serial port

		This methods flushes the data from the serial connection
		and then retrieves the new data
	"""
	logging.info("Getting sensor data ... ")
	try:
		conn.flushInput()
		data = ""
		while 1:
			data = conn.readline()

			if data != "":
				break
		print "Raw data read from sensors"
		logging.debug("Raw Serial Data: " + data)	
		return data
	except:
		return ""		
		

def changeTimeSlice(newTime):
	DEFAULT_TIME = newTime

def getCurrentTimeSlice():
	return DEFAULT_TIME

def parseData(data):
	result = {}
	if data != "":
		sensors_values = data.split(",")

		if len(sensors_values):
			for sensor in sensors_values:
				sensorType, value = sensor.split(":")
				
				result[sensorType] = float(value)
				

	return result
					
def mapLightValue(value):
	return value

def mapTempValue(value):
	"""	
		Maps the raw value of the temperature to F 
	
		It uses the Steinhart-Hart equation
	"""
	temp = math.log1p((10240000/value) - 10000)
	temp = 1 / (0.001129148 + (0.000234125 + (0.0000000876741 * temp * temp)) * temp)
	temp = temp - 273.15
	temp = (temp * 9.0)/5.0 + 32.0 #Celsius to Fahrenheit)
	
	temp = 150 - temp
	logging.debug("Temperature mapped value: " + str(temp))
	return temp

def mapBatValue(value):
	return value

def mapData(data):
	result = {}
	if data:
		for key, value in data.iteritems():
			if key == LIGHT_SENSOR:
				mappedValue = mapLightValue(value)
				result[LIGHT_SENSOR] = mappedValue
			elif key == TEMP_SENSOR:
				mappedValue = mapTempValue(value)
				result[TEMP_SENSOR] = mappedValue
			elif key == BAT_SENSOR:
				mappedValue = mapBatValue(value)
				result[BAT_SENSOR] = mappedValue

	logging.debug("Data mapped: " + str(result))
	return result
			


		

def recordInDB(data, db):
	parsedData = parseData(data)	
	mappedData = mapData(parsedData)

	for key, value in mappedData.iteritems():
		record = {"type":key,
			"reading":value,
			"timeStamp":datetime.datetime.utcnow()}	

		posts_id = db.sensors.insert_one(record).inserted_id
		
		logging.debug("Record inserted: " + str(record))
	print "Data inserted in the local Database"


def recordData(conn,port,baudrate,db):
	#checking status of the connection
	conn = checkConnection(conn, port, baudrate)
	
	#getting data from the serial
	data = getData(conn)
	
	if data != "":
		recordInDB(data,db)
	else:
		return
	threading.Timer(TIME_SLICE,recordData,(conn,PORT,BAUDRATE,db)).start()

def getLastDate(db):
	try:
		cursor = db.sensors.find().sort("timeStamp",-1).limit(1)
		for result in cursor:
			temp = result['timeStamp']
			logging.debug("Last Record Found in " +" is " + str(temp))
			return temp
	except Exception as e:
		logging.error("Error getting last date in " + "\n" + str(e))
		return

def updateCloud(db):
	isConnected = hasInternet()

	if isConnected:
		print "Updating Cloud ..."
		logging.info("Connected to internet. Checking Databases")
		remote_db = connectDBMLAB(DB_REMOTE_ADDR, DB_REMOTE_PORT,"root","root")
		
		#getting the last date inserted in the cloud
		lastRemoteDate = getLastDate(remote_db)
		lastLocalDate = getLastDate(db)
		count = 0	
		if not lastRemoteDate or lastLocalDate > lastRemoteDate:
			cursor = None
			if not lastRemoteDate:
				logging.debug("Remote DB was empty. Updating values")
				cursor = db.sensors.find()
			else:
				logging.debug("Updating remote DB")
				cursor = db.sensors.find({"timeStamp": {"$gt": lastRemoteDate}})
			for entry in cursor:
				count += 1
				record = {"type":entry['type'],
					"reading":entry['reading'],
					"timeStamp":entry['timeStamp']}	
				posts_id = remote_db.sensors.insert_one(record).inserted_id
				logging.debug("Record " + str(record) + " inserted in the Remote DB")
			print "Cloud updated! " + str(count) + " record(s) added!" 
			logging.info("Finishing inserting records in the Remote")	
		else:
			print "Cloud up to date"
		threading.Timer(TIME_SLICE_UPDATE,updateCloud,(db,)).start()
	else:
		print "Unable to update cloud. No Internet connection."
		logging.info("No Connected to Internet! Trying in " + str(TIME_SLICE_UPDATE) + " minutes")
			 	
		threading.Timer(TIME_SLICE_UPDATE,updateCloud,(db,)).start()


 
def main():
	"""
		Entry point of the program

		This is the driver method of the program. It will create the
		serial connection and the connection to the DB. It will also 
		start the thread to read and record the data.	
	"""
	#opening serial connection
	logging.basicConfig(filename="mariner.log", level=logging.DEBUG)
	logging.info('Started')

	connectionStatus = "OFFLINE"
	if hasInternet():
		connectionStatus = "ONLINE"
		

	
	print """
========== WELCOME TO MARINER ==========

Current Connection Status: %s
	
	""" % (connectionStatus)
	
	conn = openSerialConnection(PORT, BAUDRATE)

	db = connectDB(DB_ADDR, DB_PORT)
	threading.Timer(TIME_SLICE,recordData,(conn,PORT,BAUDRATE,db)).start()
	threading.Timer(TIME_SLICE_UPDATE,updateCloud,(db,)).start()

if __name__ == '__main__':
	main()	
	


