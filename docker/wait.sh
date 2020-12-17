#!/bin/bash

# wait for MSSQL server to start
export STATUS=1
i=0

while [[ $STATUS -ne 0 ]] && [[ $i -lt 30 ]]; do
	i=$i+1
	/opt/mssql-tools/bin/sqlcmd -t 1 -S localhost -U sa -P "Password12!" -Q "SELECT 1" >> /dev/null
	STATUS=$?
done

if [ $STATUS -ne 0 ]; then
	echo "Error: MSSQL took more than thirty seconds to start up."
	exit 1
fi

echo "MSSQL started!"
