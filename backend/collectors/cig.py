# Complete University Guide

from termstyle import *
import common, sys, re
from bs4 import *

def run():
	baseurl = "http://www.thecompleteuniversityguide.co.uk/league-tables/rankings?v=wide&o=wide"
	soup = common.fetch_page(baseurl)
	
	for uni in soup.find(**{"class":"leagueTable"}).find("tbody").find_all("tr"):
		tds = uni.find_all("td")
		name = tds[3].find("a").text
		rank2013 = tds[2].text.strip()
		finish = tds[-2].text.strip().replace("%", "")
		
		print yellow(">> %s is #%s and have a %s percentage completion rate" % (name, rank2013, finish) )
