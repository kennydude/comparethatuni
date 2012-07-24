'''
Compare that Uni backend

Main File
'''

from termstyle import *
import sys, os.path, importlib

args = sys.argv
if args[0] == "backend.py":
	args = args[1:]

def showUsage():
	print red("Usage: python backend.py " + bold("collector"))

print green("Compare that Uni!")
print green("Backend in PYTHON!")
print yellow("-------------------")
print yellow("Created by Joe Simpson.")

if len(args) > 0:
	try:
		module = importlib.import_module("collectors." + args[0] )
		print green("> Collecting information from " + bold(args[0]))
		module.run()
	except ImportError as e:
		print red(bold("> Could not import collector %s" % args[0]))
		print red("Reason: %s" % str(e))
		showUsage()
else:
	showUsage()
