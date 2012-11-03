import common

print "SETUP"
db = common.connectDB()

courses = db['courses']
courses.ensure_index([ ("code", 1), ("institution", 1) ], unique = True )

print "Courses : OK"

acc = db['accom']
acc.ensure_index( [ ("name", 1), ("institution", 1)  ], unique = True )
acc.ensure_index( [ ( "location", "2d" ) ] )

print "Accomodation: OK"