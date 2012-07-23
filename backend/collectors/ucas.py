from termstyle import *
import common
try:
	import mechanize
except ImportError:
	print red("ERROR: mechanize module required for UCAS Scrapping due to crappy forms")
from bs4 import *

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
			if part == "BSc":
				self.type = "Bachelor of Science"
			elif part == "BA":
				self.type = "Bachelor of Arts"
			elif part == "BEng":
				self.type = "Bachelor of Engineering"
			elif part == "BEd":
				self.type = "Bachelor of Education"
			elif part == "BDS":
				self.type = "Bachelor of Dental Surgery"
			elif part == "BMus":
				self.type = "Bachelor of Music"
			elif part == "MChem":
				self.type = "Master in Chemistry"
			elif part == "MEng":
				self.type = "Master in Engineering"
			elif part == "MComp":
				self.type = "Master in Computing"
			elif part == "MSci":
				self.type = "Master in Science"
			elif part == "MMath":
				self.type = "Master in Mathematics"
			elif part == "MMathStat":
				self.type = "Master of Mathematics and Statistics"
			elif part == "MBBS":
				self.type = "Bachelor of Medicine and Bachelor of Surgery"
			elif part == "FYr":
				self.type = "Foundation Year"
			elif part == "LLB":
				self.type = "Bachelor of Laws"
			elif part[1:] == "FT": # Move on to options
				self.options.append( CourseOption( part[:1], "Full Time") )
			elif part[1:] == "SW":
				self.options.append( CourseOption( part[:1], "Sandwich") )
					
def run():	
	baseurl = "http://search.ucas.com/cgi-bin/hsrun/search/search/search.hjx;start=search.HsSearch.run?y=%s&w=H" % common.year
	print green("> Begin UCAS Scrapping NOW")
	
	for (key, name) in common.universites.items():
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
			print yellow(">>> Found '%s' at '%s'" % ( course_name, name ))
			course_id = course.find(**{"class":"bodyTextSmallGrey"}).get_text()[1:-1]			
			
			# Parse Type
			raw_course_type = course.find(**{"class":"bodyText"}).get_text()
			course_type = CourseType( raw_course_type )		
			
			print yellow(">>>> UCAS Code '%s'. Type of course: '%s'" % ( course_id, str( course_type ) ) )
			if course_type.type == "Unknown" or len(course_type.options) == 0:
				print red(">>>> UNKNOWN COURSE TYPE! Raw: %s" % raw_course_type)
