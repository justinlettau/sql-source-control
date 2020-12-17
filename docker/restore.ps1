$container = "sql-source-control_db_1"
$server = "localhost"
$user = "sa"
$password = "Password12!"
$db = "AdventureWorks2017"

$backups = Join-Path -Path (Split-Path $PSScriptRoot -Parent) -ChildPath 'backups'
$bak = Join-Path $backups "$($db).bak"
$url = "https://github.com/Microsoft/sql-server-samples/releases/download/adventureworks/AdventureWorks2017.bak"

# Create backups directory
New-Item -ItemType Directory -Force -Path $backups

# Download database backup
$client = new-object System.Net.WebClient
$client.DownloadFile($url, $bak)

# Container paths
$src = "/tmp/$($db).bak"
$mdf = "/var/opt/mssql/data/$($db)_Data.mdf"
$ldf = "/var/opt/mssql/data/$($db)_Log.ldf"

# Copy needed files
docker cp $bak "$($container):$($src)"

# Attach database to local instance
docker exec $container /opt/mssql-tools/bin/sqlcmd `
   -S "$server" -U "$user" -P "$password" `
   -Q "RESTORE DATABASE [$db] FROM DISK = '$src' WITH MOVE '$($db)' TO '$mdf', MOVE '$($db)_log' TO '$ldf', REPLACE"
