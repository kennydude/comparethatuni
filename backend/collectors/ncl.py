# NCL

from termstyle import *
import common, csv

db = common.connectDB()

def run():
	courses = db['courses']
	for course in courses.find({ "institution" : "N21" }):
		try:
			print green(">> %s" % course['name'])

			url = "http://www.ncl.ac.uk/undergraduate/degrees/%s/courseoverview" % course['code'].lower()
			print url

			soup = common.fetch_page(url)
			details = soup.find("div", id="contentArea")

			for image in details.find_all("img"):
				image.decompose()
			for p in details.find_all("p"):
				if p.string == "" or p.string == None:
					p.decompose()
			details = details.find_all([ "p", "h4" ], recursive=False)
			
			d = ''
			for di in details:
				d += str(di)

			course['details'] = d
			course['url'] = url
			courses.save(course)
		except Exception as ex:
			print ex