[reflection.assembly]::LoadWithPartialName("Microsoft.SqlServer.Smo") | Out-Null
[reflection.assembly]::LoadWithPartialName("Microsoft.SqlServer.SqlWmiManagement") | Out-Null

$name = $env:COMPUTERNAME
$root = "$($env:appveyor_build_folder)\tools"
$instance = "SQL2017"
$server = "(local)\$instance"
$db = "AdventureWorks2017"

$bak = join-path $root "$($db).bak"
$mdf = join-path $root "$($db)_Data.mdf"
$ldf = join-path $root "$($db)_Log.ldf"
$url = "https://github.com/Microsoft/sql-server-samples/releases/download/adventureworks/AdventureWorks2017.bak"

# Download database backup
$client = new-object System.Net.WebClient
$client.DownloadFile($url, $bak)

# Attach database to local instance
sqlcmd -S "$server" -Q "Use [master]; RESTORE DATABASE [$db] FROM disk = '$bak' WITH MOVE '$($db)' TO '$mdf', MOVE '$($db)_log' TO '$ldf', REPLACE"

$smo = "Microsoft.SqlServer.Management.Smo."
$wmi = new-object ($smo + "Wmi.ManagedComputer")

# Enable TCP/IP
$uri = "ManagedComputer[@Name='$name']/ServerInstance[@Name='$instance']/ServerProtocol[@Name='Tcp']"
$Tcp = $wmi.GetSmoObject($uri)
$Tcp.IsEnabled = $true
$TCP.alter()

# Enable named pipes
$uri = "ManagedComputer[@Name='$name']/ ServerInstance[@Name='$instance']/ServerProtocol[@Name='Np']"
$Np = $wmi.GetSmoObject($uri)
$Np.IsEnabled = $true
$Np.Alter()

# Set Alias
New-Item HKLM:\SOFTWARE\Microsoft\MSSQLServer\Client -Name ConnectTo | Out-Null
Set-ItemProperty -Path HKLM:\SOFTWARE\Microsoft\MSSQLServer\Client\ConnectTo -Name '(local)' -Value "DBMSSOCN,$name\$instance" | Out-Null

# Start services
Set-Service SQLBrowser -StartupType Manual
Start-Service SQLBrowser
Start-Service "MSSQL`$$instance"
