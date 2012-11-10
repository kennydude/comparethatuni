# Birmingham
from termstyle import *
import common, sys, re
try:
	import mechanize
except ImportError:
	print red("ERROR: mechanize module required for Scrapping due to crappy forms")
from bs4 import *

from collectors.ucas import data as course_data
db = common.connectDB()

def run():
	courseDB = db['courses']
	print green("scrapping...")

	for course in courseDB.find({ "institution" : "B32" }):
		try:
			print green(">> %s" % course['name'])
			if not 'details' in course:
				url = "http://www.birmingham.ac.uk/students/courses/undergraduate/search.aspx?CourseListTextQuery=%s" % course['code']
				
				soup = common.fetch_page(url)
				url = "http://www.birmingham.ac.uk%s" % soup.find("table", **{"class":"sys_uob-listing"}).find("a")['href']

				soup = common.fetch_page(url)
				details = soup.find("div", id="CourseDetailsTab")
				details = details.find("h2", id="ProgrammeOverview").next_sibling

				for a in details.find_all("a"):
					a['href'] = "http://www.birmingham.ac.uk%s" % a['href']
					if a.get("onclick") != None:
						a['onclick'] = None
					if a.get("onkeypress") != None:
						a['onkeypress'] = None
				for image in details.find_all("img"):
					image.decompose()

				course['details'] = str(details)
				course['url'] = url
				courseDB.save(course)
		except Exception as e:
			print e