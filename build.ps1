$tempPath = Join-Path $PSScriptRoot "tmp"
$buildPath = Join-Path $PSScriptRoot "build"
$iconsPath = Join-Path $buildPath "res" "icons"

function DownloadIcons {
    Write-Output "====== Downloading & processing icons ======"
    New-Item -Type Directory -Path $tempPath -Force | Out-Null
    
    #DownloadAWSIcons
    DownloadAzureIcons
}

function DownloadAWSIcons {
    Write-Output "------ AWS ------"
    $zipPath = join-path $tempPath "AWS.zip"
    $extractPath = join-path $tempPath "AWS"
    $destPath = join-path $iconsPath "AWS"

    Write-Output "Download..."
    Invoke-WebRequest -Uri "https://d1.awsstatic.com/webteam/architecture-icons/q3-2022/Asset-Package_07312022.e9f969935ef6aa73b775f3a4cd8c67af2a4cf51e.zip" -OutFile $zipPath
    Write-Output "Done"

    Write-Output "Extract..."
    New-Item -Type Directory -Path $extractPath -Force | Out-Null
    Expand-Archive -Path $zipPath -DestinationPath $extractPath -Force
    Write-Output "Done"

    Write-Output "Copy :"
    New-Item -Type Directory -Path $destPath -Force | Out-Null
    $svgFilesRaw = Get-ChildItem $extractPath -Recurse | `
        Select-Object -ExpandProperty FullName | `
        Where-Object { $_.EndsWith(".svg") -and -not $_.Contains("\\.") -and -not $_.Contains("__MACOSX") }

    # filtering the lowest resolution icons
    $svgFilesParsed = @()
    foreach ($svgFile in $svgFilesRaw) {       
        $obj = [PSCustomObject]@{
            FullName = $svgFile
            FileName = $svgFile.Split("\")[-1]
        }

        $obj.FileName -match "(.*)_(\d\d)_?(Light|Dark)?.svg" | Out-Null

        $obj | Add-Member -MemberType NoteProperty -Name "Size" -Value ([int]($Matches[2]))
        $obj | Add-Member -MemberType NoteProperty -Name "BaseName" -Value $Matches[1]
        if ($Matches.count -eq 4) {
            $obj | Add-Member -MemberType NoteProperty -Name "Name" -Value ("$($obj.BaseName)_$($Matches[3]).svg")
        }
        else {
            $obj | Add-Member -MemberType NoteProperty -Name "Name" -Value ("$($obj.BaseName).svg")
        }

        $svgFilesParsed += $obj
    }

    $svgFilesParsed | Group-Object -Property Name | ForEach-Object {
        if ($_.Count -eq 1) {
            Write-Output "    Copy $($_.Group[0].FullName) as $($_.Group[0].Name)  ..."
            Copy-Item -Path $_.Group[0].FullName -Destination (Join-Path $destPath $_.Name) -Force
        }
        else {
            $maxSize = $_.Group | Measure-Object -Property Size -Maximum | Select-Object -ExpandProperty Maximum

            $obj = $_.Group | Where-Object { $_.Size -eq $maxSize }

            Write-Output "    Copy $($obj.FullName) as $($obj.Name)  ..."
            Copy-Item -Path $obj.FullName -Destination (Join-Path $destPath $_.Name) -Force
        }
    }
    Write-Output "Done"
}

function DownloadAzureIcons {
    Write-Output "------ Azure ------"
    $zipPath = join-path $tempPath "Azure.zip"
    $extractPath = join-path $tempPath "Azure"
    $destPath = join-path $iconsPath "Azure"

    Write-Output "Download..."
    Invoke-WebRequest -Uri "https://arch-center.azureedge.net/icons/Azure_Public_Service_Icons_V11.zip" -OutFile $zipPath
    Write-Output "Done"

    Write-Output "Extract..."
    New-Item -Type Directory -Path $extractPath -Force | Out-Null
    Expand-Archive -Path $zipPath -DestinationPath $extractPath -Force
    Write-Output "Done"

    Write-Output "Copy :"
    New-Item -Type Directory -Path $destPath -Force | Out-Null
    $svgFilesRaw = Get-ChildItem $extractPath -Recurse | `
        Select-Object -ExpandProperty FullName | `
        Where-Object { $_.EndsWith(".svg") }

    # filtering the lowest resolution icons
    $svgFilesParsed = @()
    foreach ($svgFile in $svgFilesRaw) {       
        $obj = [PSCustomObject]@{
            FullName = $svgFile
            FileName = $svgFile.Split("\")[-1]
        }

        $obj.FileName -match "(?:\d{5}-icon-service-)(.*).svg" | Out-Null

        $obj | Add-Member -MemberType NoteProperty -Name "BaseName" -Value $Matches[1]
        $obj | Add-Member -MemberType NoteProperty -Name "Name" -Value ("$($obj.BaseName).svg")        

        $svgFilesParsed += $obj
    }

    foreach ($svgFileParsed in $svgFilesParsed) {
        Write-Output "    Copy $($svgFileParsed.FullName) as $($svgFileParsed.Name)  ..."
        Copy-Item -Path $svgFileParsed.FullName -Destination (Join-Path $destPath "Azure-$($svgFileParsed.Name)") -Force
    }

    Write-Output "Done"
}

Write-Output "Starting DrawTheNet build process..."

DownloadIcons

Write-Output "Cleanup ..."
#Remove-Item -path $tempPath -recurse -force

Write-Output "All Done"