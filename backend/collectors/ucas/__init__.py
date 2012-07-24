from termstyle import *
import common, sys
try:
	import mechanize
except ImportError:
	print red("ERROR: mechanize module required for UCAS Scrapping due to crappy forms")
from bs4 import *

from collectors.ucas import data as course_data

class ALevels(object):
	def __str__(self): return "A Level Requirement<%s>" % self.options
	def __init__(self, text):
		values = {
			"A*" : 6,
			"A" : 5,
			"B" : 4,
			"C" : 3,
			"D" : 2,
			"E" : 1
		}
		options = text.split("-")
		self.options = []
		for option in options:
			option = common.split_str(option)
			option.sort()
			option.reverse()
			# Should now be like BAA
			value = ''
			for grade in option:
				value += str(values[grade])
			self.options.append(value)

class CourseOption(object):
	def __init__(self, years, way):
		self.years = int(years)
		self.way = way
	def __repr__(self):
		return "CourseOption<%i years %s>" % ( self.years, self.way )

class CourseType(object):
	def __str__(self): return "CourseType<%s, Options: %s>" % (self.type, str(self.options) )
	def __init__(self, data):
		# Step 1: Split
		fparts = data.split(" ")
		parts = []
		for part in fparts:
			parts = parts + part.split("/")

		# Step 2: Chunk out the parts
		self.type = "Unknown"
		self.options = []
		for part in parts:
			part = part.upper()
			if part in course_data.data:
				self.type = course_data.data[part]
			elif part[1:] == "FT": # Move on to options
				self.options.append( CourseOption( part[:1], "Full Time") )
			elif part[1:] == "SW":
				self.options.append( CourseOption( part[:1], "Sandwich") )

def run():	
	baseurl = "http://search.ucas.com/cgi-bin/hsrun/search/search/search.hjx;start=search.HsSearch.run?y=%s&w=H" % common.year
	print green("> Begin UCAS Scrapping NOW")
	
	for (key, name) in common.universites.items()[1:2]:
		print green(">> "+ name)
		br = mechanize.Browser()
		br.open(baseurl)
		br.select_form(name="Form1")

		br['cmbInst'] = [key]
		data = br.submit()
		
		soup = BeautifulSoup(data)
		courses = soup.find("table", summary="results").find("table").find_all("tr")
		for course in courses[4:]:
			course_name = course.find(**{"class":"bodyLink"}).get_text()
			print green(">>> Found '%s' at '%s'" % ( course_name, name ))
			course_id = course.find(**{"class":"bodyTextSmallGrey"}).get_text()[1:-1]			
			
			# Parse Type
			raw_course_type = course.find(**{"class":"bodyText"}).get_text()
			course_type = CourseType( raw_course_type )		
			
			print yellow(">>>> UCAS Code '%s'. Type of course: '%s'" % ( course_id, str( course_type ) ) )
			if course_type.type == "Unknown" or len(course_type.options) == 0:
				print red(">>>> UNKNOWN COURSE TYPE! Raw: %s" % raw_course_type)
			
			print yellow(">>>> Finding Entry Requirements."),
			br.open( course.find(**{"class":"bodyLink"})['href'] )
			
			sys.stdout.write( yellow(".") )
			sys.stdout.flush()
			
			br.follow_link( url_regex = "HsProfile" )
			
			sys.stdout.write( yellow(".") )
			sys.stdout.flush()
			
			entry_data = br.follow_link( url_regex = "HsEntryReq" )
			print yellow(" done")

			entry_soup = BeautifulSoup( entry_data )
			alevels = entry_soup.find("td", text="GCE A/AS level grade range" ).next_sibling.text
			if alevels != "": alevels = ALevels(alevels)			
			print yellow( ">>>> A-Levels needed: %s" %  alevels )
