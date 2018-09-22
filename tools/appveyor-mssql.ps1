[reflection.assembly]::LoadWithPartialName("Microsoft.SqlServer.Smo") | Out-Null
[reflection.assembly]::LoadWithPartialName("Microsoft.SqlServer.SqlWmiManagement") | Out-Null

$startPath = "$($env:appveyor_build_folder)\tools"
$sqlInstance = "(local)\SQL2017"
$dbName = "AdventureWorks2017"

$bakFile = join-path $startPath "$($dbName).bak"
$mdfFile = join-path $startPath "$($dbName)_Data.mdf"
$ldfFile = join-path $startPath "$($dbName)_Log.ldf"
$downloadUrl = "https://github.com/Microsoft/sql-server-samples/releases/download/adventureworks/AdventureWorks2017.bak"

# Download database backup
$client = new-object System.Net.WebClient
$client.DownloadFile($downloadUrl, $bakFile)

# Attach database to local instance
sqlcmd -S "$sqlInstance" -Q "Use [master]; RESTORE DATABASE [$dbName] FROM disk = '$bakFile' WITH MOVE '$($dbName)' TO '$mdfFile', MOVE '$($dbName)_log' TO '$ldfFile', REPLACE"

$serverName = $env:COMPUTERNAME
$instanceName = "SQL2017"
$smo = "Microsoft.SqlServer.Management.Smo."
$wmi = new-object ($smo + "Wmi.ManagedComputer")

# Enable TCP/IP
$uri = "ManagedComputer[@Name='$serverName']/ServerInstance[@Name='$instanceName']/ServerProtocol[@Name='Tcp']"
$Tcp = $wmi.GetSmoObject($uri)
$Tcp.IsEnabled = $true
$TCP.alter()

# Enable named pipes
$uri = "ManagedComputer[@Name='$serverName']/ ServerInstance[@Name='$instanceName']/ServerProtocol[@Name='Np']"
$Np = $wmi.GetSmoObject($uri)
$Np.IsEnabled = $true
$Np.Alter()

# Set Alias
New-Item HKLM:\SOFTWARE\Microsoft\MSSQLServer\Client -Name ConnectTo | Out-Null
Set-ItemProperty -Path HKLM:\SOFTWARE\Microsoft\MSSQLServer\Client\ConnectTo -Name '(local)' -Value "DBMSSOCN,$serverName\$instanceName" | Out-Null

# Start services
Set-Service SQLBrowser -StartupType Manual
Start-Service SQLBrowser
Start-Service "MSSQL`$$instanceName"
