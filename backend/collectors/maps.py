# Google Maps

from termstyle import *
import common, csv

db = common.connectDB()

key = "AIzaSyDCg9QcZLa5GXCfpUtQOuKi_LLTHG-T1_0" # please do not abuse. i trust you
types = {
	"shop":"grocery_or_supermarket",
	"drink":"bar|liquor_store",
	"leisure":"gym|zoo|spa|movie_theater|art_gallery"
}

def run():
	accom_db = db['accom']
	for accom in accom_db.find():
		print green(">> %s" % accom['name'])
		url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=%s&location=%s&sensor=false&rankby=distance" % (
			key,
			"%s,%s" % ( accom['location'][0], accom['location'][1] )
		)

		accom['nearby'] = {}

		for t in types.items():
			print blue(">>> %s" % t[0])
			t_url = "%s&types=%s" % (url, t[1])
			response = common.get_json("%s" % t_url)

			accom['nearby'][t[0]] = []

			for place in response['results'][0:5]:
				print yellow(">>>> %s" % place['name'])
				# Really Google? Can't even return us a URL?
				detail_url = "https://maps.googleapis.com/maps/api/place/details/json?sensor=false&key=%s&reference=%s" % (
					key,
					place['reference']
				)
				place = common.get_json(detail_url)
				place = {
					"name" : place['result']['name'],
					"icon" : place['result']['icon'],
					"url" : place['result']['url']
				}
				accom['nearby'][t[0]].append(place)
		print green(">> OK")
		accom_db.save(accom)