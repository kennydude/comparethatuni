from termstyle import *
import common, sys, re
try:
	import mechanize
except ImportError:
	print red("ERROR: mechanize module required for UCAS Scrapping due to crappy forms")
from bs4 import *

from collectors.ucas import data as course_data
db = common.connectDB()

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
			if value != '':
				self.options.append(int(value))

class CourseOption(object):
	def __init__(self, years, way):
		self.years = int(years)
		self.way = way
	def __repr__(self):
		return "CourseOption<%i years %s>" % ( self.years, self.way )
	def toObject(self):
		return {
			"years" : self.years,
			"way" : self.way
		}

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
	def toObject(self):
		return map(lambda x: x.toObject(), self.options)

def run():	
	courseDB = db['courses']
	baseurl = "http://search.ucas.com/cgi-bin/hsrun/search/search/search.hjx;start=search.HsSearch.run?y=%s&w=H" % common.year
	print green("> Begin UCAS Scrapping NOW")
	
	for (key, name) in common.universites.items()[1:]:
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

			courseData = {
				"name" : course_name,
				"institution" : key,
				"entry" : { "required" : {}, "excluded" : {} }
			}

			print green(">>> Found '%s' at '%s'" % ( course_name, name ))
			course_id = course.find(**{"class":"bodyTextSmallGrey"}).get_text()[1:-1]			
			
			# Parse Type
			raw_course_type = course.find(**{"class":"bodyText"}).get_text()
			course_type = CourseType( raw_course_type )		
			
			print yellow(">>>> UCAS Code '%s'. Type of course: '%s'" % ( course_id, str( course_type ) ) )
			if course_type.type == "Unknown" or len(course_type.options) == 0:
				print red(">>>> UNKNOWN COURSE TYPE! Raw: %s" % raw_course_type)

			courseData['code'] = course_id
			courseData['type'] = {
				"name" : course_type.type,
				"options" : course_type.toObject()
			}
			
			entry_data = br.open( course.find(**{"class":"bodyLink"})['href'] )
			light_c = BeautifulSoup( entry_data )
			campuses = light_c.find("div", text="Campuses and associated colleges").parent.find("table").find_all("tr")[4:-2]
			campus = campuses[0].find_all("td")[2].text
			print yellow(">>>> At campus '%s'" % campus)

			courseData['campus'] = campus
			
			print yellow(">>>> Finding Entry Requirements...")
			entry_data = br.open( course.find(**{"class":"bodyLink"})['href'].replace("HsDetails", "HsEntryReq") )

			entry_soup = BeautifulSoup( entry_data )
			try:
				alevels = entry_soup.find("td", text="GCE A/AS level grade range" ).next_sibling.text
				if alevels != "": alevels = ALevels(alevels)			
				print yellow( ">>>> A-Levels needed: %s" %  alevels )
				courseData['entry']['alevels'] = alevels.options
			except:
				print yellow(">>>> No A-Levels required")	

			csr = entry_soup.find("td", text="Course Specific Requirements" )
			if csr != None:
				csr = csr.next_sibling.text
				print ">>>> %s" % csr
				courseData['entry']['specific'] = csr

			req = entry_soup.find("span", text=re.compile("GCSE"))
			if req != None:
				req = req.next_sibling.next_sibling.find("td", text="Subjects and grades required")
			if req != None:
				req = req.next_sibling.text
				print ">>>> req %s" % req
				courseData['entry']['required']['subjects'] = req

			excl = entry_soup.find("span", text="GCE A level")
			if excl != None:
				excl = excl.find("td", text="Excluded Subjects")
				if excl != None:
					excl = excl.next_sibling.text
					print ">>>> excl %s" % excl
					courseData['entry']['excluded']['subjects'] = excl
			
			tarrif = entry_soup.find("td", text="Tariff score")
			if tarrif != None:
				tarrif = tarrif.next_sibling
			if tarrif != None:
				try:
					# we only want 1 number to compare against!
					tarrif = str(tarrif).split(":")[1].split("<")[0].split("-")[0].strip()
					tarrif = re.sub("[a-zA-Z \t]+", "", tarrif)
					print ">>>> Tarrif Score: %s" % tarrif
					courseData['entry']['tarrif'] = int(tarrif)
				except:
					print tarrif, "E"

			print courseData
			courseDB.save(courseData)