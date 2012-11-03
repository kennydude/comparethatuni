from termstyle import *
import common, csv

db = common.connectDB()

def doFlag(flag):
	if flag == "Y":
		return True
	elif flag == "N":
		return False
	else:
		print flag

def run():
	accom_items = db['accom_items']
	accom = db['accom']
	s = csv.reader( open("data/AccData.csv") )
	data = []
	for row in s:
		data.append(row)

	bathroom_data = {
		"N" : "N",
		"En-Suite" : "E",
		"Washbasin" : "W"
	}
	halls = []

	for row in data[1:]:
		item = {
			"institution" : row[2],
			"name" : row[0],
			"description" : row[1],
			"flags" : {
				"catered" : doFlag(row[4]),
				"uni_owned" : doFlag(row[5]),
				"internet" : doFlag(row[9]),
				"tv" : doFlag(row[10]),
				"bills" : doFlag(row[13]),
				"laundry" : doFlag(row[17]),
				"bike_store" : doFlag(row[18]),
				"bar" : doFlag(row[19])
			},
			"deposit" : row[20].replace("\xc2\xa3", ""),
			"for" : row[11] * 1,
			"bathroom" : bathroom_data[row[7]],
			"number" : row[8],
			"contract" : row[15].split(","),
			"cost_per_week" : row[12].replace("\xc2\xa3", "") # Dafuq Google?
		}
		accom_items.save(item)
		if "%s-%s" % (row[0], row[2]) not in halls:
			halls.append("%s-%s" % (row[0], row[2]))
			hall = {
				"institution" : row[2],
				"name" : row[0],
				"website" : row[14],
				"facebook" : row[16],
				"location" : map(lambda x: float(x.strip()), row[6].split(",")),
				"extra" : row[21]
			}
			accom.save(hall)
		print "OK"
	print "ALL OK"