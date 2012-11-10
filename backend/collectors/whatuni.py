# WhatUni

import common, csv, re
from termstyle import *

db = common.connectDB()

mapping = {
	"N21" : "http://www.whatuni.com/degrees/university-uk/newcastle-university-ranking/3755/page.html",
	"I50" : "http://www.whatuni.com/degrees/university-uk/Imperial-College-London-ranking/3813/page.html",
	"N77" : "http://www.whatuni.com/degrees/university-uk/Northumbria-University-ranking/5363/page.html",
	"T20" : "http://www.whatuni.com/degrees/university-uk/Teesside-University-ranking/5626/page.html",
	"B32" : "http://www.whatuni.com/degrees/university-uk/University-Of-Birmingham-ranking/5666/page.html"
}

def dig_rating(obj):
	return obj.find("span", **{"class" : re.compile("rstar[0-9]+")})['class'][0].translate(None, "abcdefghijklmnopqrstuvwxy")

def get_rating(name, soup):
	return dig_rating( soup.find("strong", text=name).parent.parent )

def run():
	unis = db['university']

	for (uni, url) in mapping.items():
		print green(">> %s" % uni)
		soup = common.fetch_page(url)

		times_rank = soup.find("div", **{"class":"times-rank" }).find("strong").string
		t_extra = soup.find("ul", **{"class":"top-crs-list"})

		times = {
			"rank" : times_rank,
			"satisfaction" : t_extra.find_all("li")[0].find("span").string,
			"job_percent" : t_extra.find_all("li")[1].find("span").string,
			"dropout" : t_extra.find_all("li")[2].find("span").string
		}

		r = soup.find("div", **{"class":"rating"})

		rating = {
			"overall" : dig_rating(r),
			"city_life" : get_rating(" City Life ", soup),
			"facilities" : get_rating(" Uni Facilities ", soup),
			"union" : get_rating(" Student Union ", soup),
			"societies" : get_rating(" Clubs & Societies ", soup),
			"course_and_lecturers" : get_rating(" Course & Lecturers ", soup)
		}
		
		db_uni = unis.find_one({"code" : uni})
		db_uni['ranking']['times'] = times
		db_uni['ranking']['whatuni'] = rating
		unis.save(db_uni)

