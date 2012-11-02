import common

print "SETUP"
db = common.connectDB()

courses = db['courses']
courses.ensure_index([ ("code", 1), ("institution", 1) ], unique = True )

print "Courses : OK"