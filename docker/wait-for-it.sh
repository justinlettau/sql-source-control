#!/bin/bash

# wait for MSSQL server to start
export STATUS=1
i=0

while [[ $STATUS -ne 0 ]] && [[ $i -lt 60 ]]; do
	i=$i+1
	echo "Waiting for MSSQL to start ..."
	/opt/mssql-tools/bin/sqlcmd -t 1 -S localhost -U sa -P $MSSQL_SA_PASSWORD -Q "SELECT 1" >> /dev/null
	STATUS=$?
	sleep 1
done

if [ $STATUS -ne 0 ]; then
	echo "Error: MSSQL took more than 60 seconds to start up."
	exit 1
fi

echo "MSSQL started!"
