import common, re
from termstyle import *
from bs4 import *

try:
	import mechanize, htmlentities
except ImportError:
	print red("ERROR: mechanize, htmlentities module required")

def run():
	baseurl = "http://www.gaybydegree.org.uk/index.php?dir=university&task=university"
	print green("> GayByDegree.co.uk scrapping starts now")

	checklist_str = {
		"Policy that protects LGB students from bullying" : "policy",
		"Compulsory Staff Training on LGB issues" : "training",
		"Society for LGB students" : "society",
		"Info for students on LGB issues" : "info",
		"Stonewall Diversity Champion" : "diversity",
		"Events for LGB students" : "events",
		"Explicit welfare support for LGB students" : "welfare",
		"Consultation with LGB students" : "consulation",
		"Specific career advice for LGB students" : "career"
	}

	soup = common.fetch_page(baseurl, "html5lib") # awkward
	shit = ['university', 'of', 'the']
	for uni in common.universites.values():
		print green(">> %s..." % uni),
		# Sanatize into what the website uses
		uni = ' '.join( filter( lambda x: x.lower() not in shit, uni.split(' ') ) )
		# Now go for it!
		l = soup.find("a", text=re.compile(uni) )
		link = htmlentities.decode(l['href'])
		
		page_soup = common.fetch_page("http://www.gaybydegree.org.uk/%s" % link, "html5lib")
		print green(bold(" got information"))
		
		checklist = {}
		for (txt, db_term) in checklist_str.items():
			p = page_soup.find(text=txt)
			i = p.parent.find("img")
			has = "greentick" in i['src']
			if has:
				print green(">>> Has: %s" % txt)
			else:
				print red(">>> Does not have: %s" % txt)
			checklist[db_term] = has
		print checklist
