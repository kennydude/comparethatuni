year = "2013"

import urllib2
from bs4 import *

def fetch_page(page):
	page = urllib2.urlopen(page)
	return BeautifulSoup(page)

universites = {
	"N21" : "Newcastle University"
}
