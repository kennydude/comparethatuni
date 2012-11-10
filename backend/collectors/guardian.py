import common, csv
from termstyle import *
from data import hesa_ucas

db = common.connectDB()

def run():
	unis = db['university']
	s = csv.reader( open("data/Guardian University Table 2013 - Institutions.csv") )
	data = []
	for row in s:
		data.append(row)

	for row in data[2:]:
		place = row[0].split(" ")[-1]
		name = row[1]
		
		print green("> %s is at #%s" % (name, place) ) 
		
		ucas = hesa_ucas.data[ ( ( 4 - len(row[3]) ) * '0' ) + row[3] ]
		if ucas[1] != '':
			print green('>> UCAS CODE: %s' % ucas[1])

			uni = unis.find_one({"code" : ucas[1]})
			if uni != None:
				# Field Trial
				if 'ranking' not in uni:
					uni['ranking'] = {}
				uni['ranking']['guardian'] = place
				unis.save(uni)

		else:
			print red('>> No UCAS Entry')
