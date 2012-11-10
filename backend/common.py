year = "2013"

import urllib2, json
from bs4 import *

def get_json(page, headers = []):
	opener = urllib2.build_opener()
	headers.extend([
		('User-agent', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/536.11 (KHTML, like Gecko) Chrome/20.0.1132.57 Safari/536.11')
	])
	opener.addheaders = headers
	return json.load(opener.open(page))

def fetch_page(page, parser=None):
	opener = urllib2.build_opener()
	opener.addheaders = [('User-agent', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/536.11 (KHTML, like Gecko) Chrome/20.0.1132.57 Safari/536.11')]
	args = []
	if parser != None:
		args.append(parser)
	return BeautifulSoup(opener.open(page).read(), *args)

universites = {
	"T20" : "Teesside University",
	"N21" : "Newcastle University",
	"I50" : "Imperial College",
	"N77" : "Northumbria University",
	"B32" : "The University of Birmingham"
}

ukprn = {
	"T20" : 10007161,
	"N21" : 10007799,
	"I50" : 10003270,
	"N77" : 10001282,
	"B32" : 10006840
}

def connectDB():
	from pymongo import Connection
	return Connection()['comparethatuni']

def split_str(i):
	r = []
	import string
	for x in range(0, len(i)):
		if i[x] in string.ascii_letters:
			r.append(i[x])
	return r
