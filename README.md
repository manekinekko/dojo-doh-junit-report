Dojo DOH Junit XML Report
=

A simple patch that allows Dojo DOH to generate XML JUnit compliant report

Usage
=

Place this module in the DOH folder (at the same directory as the "runner.js"). And load it from the _nodeRunner.js, if you need to generate XML output.

Step by step guide
==

In order to make sure this script does work. Please follow these steps:

1) clone the dojo/util repo (https://github.com/dojo/util)
```git clone https://github.com/dojo/util dojo-utils```

2) cd into the DOH folder
```cd dojo-utils/doh/```

3) copy the runner-junit.js in this folder (near _nodeRunner.js)
```
├── LICENSE
├── README
├── Robot.html
├── _browserRunner.js
├── _nodeRunner.js <-- THIS
├── _parseURLargs.js
├── _rhinoRunner.js
├── _sounds
├── doh.profile.js
├── junit.xml
├── main.js
├── mobileRunner.html
├── package.json
├── plugins
├── robot
├── robot.js
├── runner-junit.js <-- THIS
├── runner.html
├── runner.js
├── runner.sh
├── small_logo.png
└── tests

```


4) edit the _nodeRunner.js and include the runner-junit module, you should have something like this:
``` define(["doh/runner-junit", "require"], function(doh, require) { ```

5) test it like this (you need to install Nodejs):
```node ../../dojo/dojo.js baseUrl=../../dojo load=doh test=tests/selfTest.js > report.xml```

6) Voila!

How does it work?
=

This patch overrides the DOH methods, in order to implement the new XML output. The DOH methods being overriden start from [this line](https://github.com/manekinekko/dojo-doh-junit-report/blob/master/runner-junit.js#L322).

Contribution
= 

This code needs some improvements. Please feel free to submit fixes or fork...

License
=

Dojo license (http://dojotoolkit.org/license)
