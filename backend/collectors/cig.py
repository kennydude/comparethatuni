# Complete University Guide

from termstyle import *
import common, sys, re
from bs4 import *

db = common.connectDB()

mapping = {
	"Newcastle" : "N21",
	"Imperial College London" : "I50",
	"Northumbria" : "N77",
	"Teesside" : "T20",
	"Birmingham" : "B32"
}

def run():
	unis = db['university']
	baseurl = "http://www.thecompleteuniversityguide.co.uk/league-tables/rankings?v=wide&o=wide"
	soup = common.fetch_page(baseurl)
	
	for uni in soup.find(**{"class":"leagueTable"}).find("tbody").find_all("tr"):
		tds = uni.find_all("td")
		name = tds[3].find("a").text
		rank2013 = tds[2].text.strip()
		finish = tds[-2].text.strip().replace("%", "")
		
		print yellow(">> %s is #%s and have a %s percentage completion rate" % (name, rank2013, finish) )
		if name in mapping:
			print mapping[name]
			uni = unis.find_one({"code" : mapping[name]})
			print uni
			uni['ranking']['cig'] = { "place" : rank2013, "finish" : finish }
			unis.save(uni)