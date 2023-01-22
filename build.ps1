$tempPath = Join-Path $PSScriptRoot "tmp"
$buildPath = Join-Path $PSScriptRoot "dist"
$iconsPath = Join-Path $buildPath "res" "icons"
$iconsJSONPath = Join-Path $iconsPath "icons.json"

$srcPath = Join-Path $PSScriptRoot "src"

function DownloadIcons {
    Write-Output "====== Downloading & processing icons ======"
    New-Item -Type Directory -Path $tempPath -Force | Out-Null
    
    DownloadAWSIcons
    #DownloadAzureIcons
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

        if($obj.FullName.Contains("Architecture-Service-Icons"))
        {
            $obj.FullName -match "\\Arch_([\da-zA-Z-_]*)\\(?:Arch_)?\d\d\\(?:Arch_ ?(?:Amazon|AWS)?-?)([\da-zA-Z-_]*) ?_(\d\d)_?.svg" | Out-Null

            $obj | Add-Member -MemberType NoteProperty -Name "Size" -Value ([int]($Matches[3]))
            $obj | Add-Member -MemberType NoteProperty -Name "BaseName" -Value "AWS_$($Matches[1])_$($Matches[2])"
            
            $obj | Add-Member -MemberType NoteProperty -Name "DestName" -Value "$($obj.BaseName).svg"
        }
        elseif ($obj.FullName.Contains("Category-Icons")) {
            $obj.FullName -match "\\Arch-Category_\d\d\\Arch-([\da-zA-Z-_]*)_(\d\d).svg" | Out-Null

            $obj | Add-Member -MemberType NoteProperty -Name "Size" -Value ([int]($Matches[2]))
            $obj | Add-Member -MemberType NoteProperty -Name "BaseName" -Value "AWS_$($Matches[1])"
            
            $obj | Add-Member -MemberType NoteProperty -Name "DestName" -Value "$($obj.BaseName).svg"
        }
        elseif ($obj.FullName.Contains("Res_")) {
            $obj.FullName -match "\\Res_([\dA-Za-z-_]*)\\[\dA-Za-z-_]*\\Res_(?:AWS|Amazon)?-?([\dA-Za-z-_\.]*) ?_(\d\d)_(Light|Dark).svg" | Out-Null

            $obj | Add-Member -MemberType NoteProperty -Name "Size" -Value ([int]($Matches[3]))
            $obj | Add-Member -MemberType NoteProperty -Name "BaseName" -Value "AWS_$($Matches[1])_$($Matches[2])_$($Matches[4])"
            
            $obj | Add-Member -MemberType NoteProperty -Name "DestName" -Value "$($obj.BaseName).svg"
        }

        $svgFilesParsed += $obj
    }

    $copiedFiles = @()

    $svgFilesParsed | Group-Object -Property BaseName | ForEach-Object {
        if ($_.Count -eq 1) {
            Write-Output "    Copy $($_.Group[0].FullName) as $($_.Group[0].DestName)  ..."
            Copy-Item -Path $_.Group[0].FullName -Destination (Join-Path $destPath $_.Group[0].DestName) -Force
        }
        else {
            $maxSize = $_.Group | Measure-Object -Property Size -Maximum | Select-Object -ExpandProperty Maximum

            $obj = $_.Group | Where-Object { $_.Size -eq $maxSize }

            Write-Output "    Copy $($obj.FullName) as $($obj.DestName)  ..."
            Copy-Item -Path $obj.FullName -Destination (Join-Path $destPath $obj.DestName) -Force
        }
        $copiedFiles += $_.BaseName
    }

    Write-Output "Adding data to icons.json..."
    $iconsJson = $null
    
    if (test-path $iconsJSONPath) {
        $iconsJson = Get-Content $iconsJSONPath | ConvertFrom-Json
    }
    else {
        $iconsJson = [PSCustomObject]@{
        }
    }
    
    $iconsJson | Add-Member -MemberType NoteProperty -Name "AWS" -Value $copiedFiles -Force | Out-Null
    $iconsJson | ConvertTo-Json -Depth 100 | Out-File $iconsJSONPath -Force

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

    Write-Output "Adding data to icons.json..."
    $iconsJson = $null
    
    if (test-path $iconsJSONPath) {
        $iconsJson = Get-Content $iconsJSONPath | ConvertFrom-Json
    }
    else {
        $iconsJson = [PSCustomObject]@{
        }
    }
    
    $iconsJson | Add-Member -MemberType NoteProperty -Name "Azure" -Value $copiedFiles -Force | Out-Null
    $iconsJson | ConvertTo-Json -Depth 100 | Out-File $iconsJSONPath -Force

    Write-Output "Done"
}

function CopySrc {
    Write-Output "====== Copying sources content ======"
    Copy-Item -Path "$srcPath/*" -Destination $buildPath -Recurse -Force
}

function InitCleanup {
    Write-Output "====== Cleaning dist ======"
    Remove-Item -Path $buildPath -Recurse -Force
}

function EndCleanup {
    Write-Output "====== Cleaning tmp ======"
    Remove-Item -Path $tempPath -Recurse -Force
}

Write-Output "Starting DrawTheNet build process..."

InitCleanup
DownloadIcons
CopySrc
#EndCleanup

Write-Output "All Done"