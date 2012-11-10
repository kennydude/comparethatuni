# Unistats!

from termstyle import *
import common, csv, urllib2
from collectors.ucas import data as u_data
data = {}
for (key, value) in u_data.data.items():
	data[value] = key

db = common.connectDB()

key = "5KGGF5KL3HQC26GDMUWY"

def run():
	base_url = "http://data.unistats.ac.uk/"
	auth_handler = urllib2.HTTPBasicAuthHandler()
	auth_handler.add_password(realm='Unistats KIS Data API',
		uri='http://data.unistats.ac.uk',
		user=key,
		passwd='kadidd!ehopper')
	opener = urllib2.build_opener(auth_handler)
	# ...and install it globally so it can be used with urlopen.
	urllib2.install_opener(opener)

	courses = db['courses']
	for course in courses.find()[:60]:
		print green(">> %s" % course['name'])
		if(course['type']['name'] != "Unknown"):
			url = "%sapi/KIS/Institution/%s/Course/%s_%s/Statistics.json" % (
				base_url,
				common.ukprn[ course['institution'] ],
				data[ course['type']['name'] ],
				course['code']
			)
			print url
			#page = common.get_json(url )
			#print url, page


			# This doesn't work. Unistats is broken