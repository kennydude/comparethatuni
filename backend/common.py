year = "2013"

import urllib2
from bs4 import *

def fetch_page(page):
	page = urllib2.urlopen(page)
	return BeautifulSoup(page)

universites = {
	"N21" : "Newcastle University",
	"T20" : "Teeside University",
	"I50" : "Imperial College London",
	"N77" : "Northumbria University",
	"B32" : "The University of Birmingham"
}

def split_str(i):
	r = []
	import string
	for x in range(0, len(i)):
		if i[x] in string.ascii_letters:
			r.append(i[x])
	return r
