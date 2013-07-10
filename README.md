Dojo DOH Junit XML Report
=

A simple patch that allows Dojo DOH to generate XML JUnit compliant report

Usage
=

Place this module in the DOH folder (at the same directory as the "runner.js"). And load it from the normal runner, if you need to generate XML output.

How does it work?
=

This patch overrides the DOH methods, in order to implement the new XML output. The DOH methods being overriden start from [this line](https://github.com/manekinekko/dojo-doh-junit-report/blob/master/runner-junit.js#L317).

Contribution
= 

This code is subject to improvement. Please feel free to submit fixes...

License
=

Dojo license (http://dojotoolkit.org/license)
