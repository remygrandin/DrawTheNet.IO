$tempPath = Join-Path $PSScriptRoot "tmp"
$buildPath = Join-Path $PSScriptRoot "dist"
$vendorsPath = Join-Path $PSScriptRoot "vendors"
$iconsPath = Join-Path $buildPath "res" "icons"
$iconsJSONPath = Join-Path $iconsPath "icons.json"

$srcPath = Join-Path $PSScriptRoot "src"

function DownloadIcons {
    Write-Output "====== Downloading & processing icons ======"
    New-Item -Type Directory -Path $tempPath -Force | Out-Null
    
    DownloadAWSIcons
    DownloadAzureIcons
    DownloadM365Icons
    DownloadD365Icons
    DownloadPowerPlatformIcons
    DownloadGCPIcons
    DownloadCiscoIcons
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
            $obj.FullName -match "\\Arch_([\da-zA-Z-_]*)\\(?:Arch_)?\d\d\\(?:Arch_ ?(?:Amazon|AWS)?-?)([\da-zA-Z-&_]*) ?_(\d\d)_?.svg" | Out-Null

            $obj | Add-Member -MemberType NoteProperty -Name "Size" -Value ([int]($Matches[3]))
            $obj | Add-Member -MemberType NoteProperty -Name "BaseName" -Value "$($Matches[1])_$($Matches[2])"
            
            $obj | Add-Member -MemberType NoteProperty -Name "DestName" -Value "$($obj.BaseName).svg"
        }
        elseif ($obj.FullName.Contains("Category-Icons")) {
            $obj.FullName -match "\\Arch-Category_\d\d\\Arch-([\da-zA-Z-_]*)_(\d\d).svg" | Out-Null

            $obj | Add-Member -MemberType NoteProperty -Name "Size" -Value ([int]($Matches[2]))
            $obj | Add-Member -MemberType NoteProperty -Name "BaseName" -Value "$($Matches[1])"
            
            $obj | Add-Member -MemberType NoteProperty -Name "DestName" -Value "$($obj.BaseName).svg"
        }
        elseif ($obj.FullName.Contains("Res_")) {
            $obj.FullName -match "\\Res_([\dA-Za-z-_]*)\\[\dA-Za-z-_]*\\Res_(?:AWS|Amazon)?-?([\dA-Za-z-_\.]*) ?_(\d\d)_(Light|Dark).svg" | Out-Null

            $obj | Add-Member -MemberType NoteProperty -Name "Size" -Value ([int]($Matches[3]))
            $obj | Add-Member -MemberType NoteProperty -Name "BaseName" -Value "$($Matches[1])_$($Matches[2])_$($Matches[4])"
            
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
        $copiedFiles += $_.Name
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

    $copiedFiles = $copiedFiles | Sort-Object
    
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

        $obj | Add-Member -MemberType NoteProperty -Name "BaseName" -Value "$($Matches[1])"
        $obj | Add-Member -MemberType NoteProperty -Name "Name" -Value ("$($obj.BaseName).svg")        

        $svgFilesParsed += $obj
    }

    $copiedFiles = @()

    $svgFilesParsed | Group-Object -Property BaseName | ForEach-Object {
        if ($_.Count -eq 1) {
            Write-Output "    Copy $($_.Group[0].FullName) as $($_.Group[0].Name)  ..."
            Copy-Item -Path $_.Group[0].FullName -Destination (Join-Path $destPath $_.Group[0].Name) -Force
        }
        else {
            $obj = $_.Group | Select-Object -First 1

            Write-Output "    Copy $($obj.FullName) as $($obj.Name)  ..."
            Copy-Item -Path $obj.FullName -Destination (Join-Path $destPath $obj.Name) -Force
        }
        $copiedFiles += $_.Name
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

    $copiedFiles = $copiedFiles | Sort-Object
    
    $iconsJson | Add-Member -MemberType NoteProperty -Name "Azure" -Value $copiedFiles -Force | Out-Null
    $iconsJson | ConvertTo-Json -Depth 100 | Out-File $iconsJSONPath -Force

    Write-Output "Done"
}


function DownloadM365Icons {
    Write-Output "------ M365 ------"
    $zipPath = join-path $tempPath "M365.zip"
    $extractPath = join-path $tempPath "M365"
    $destPath = join-path $iconsPath "M365"

    Write-Output "Download..."
    Invoke-WebRequest -Uri "https://go.microsoft.com/fwlink/?linkid=869455" -OutFile $zipPath
    Write-Output "Done"

    Write-Output "Extract..."
    New-Item -Type Directory -Path $extractPath -Force | Out-Null
    Expand-Archive -Path $zipPath -DestinationPath $extractPath -Force
    Write-Output "Done"

    Write-Output "Edit..."
    $svgFilesRaw = Get-ChildItem $extractPath -Recurse | `
        Select-Object -ExpandProperty FullName | `
        Where-Object { $_.EndsWith(".svg") }

    foreach ($icon in $svgFilesRaw) {
        Write-Output "    Editing  $($icon) ..."

        $iconSVG = Get-Content -Path $icon -Raw

        $title = [System.IO.Path]::GetFileNameWithoutExtension($icon)

        $iconSVG = $iconSVG -replace 'cls-', "cls-$title-"
        
        $iconSVG | Set-Content -Path $icon -Force
    }
    Write-Output "Done"

    Write-Output "Copy :"
    New-Item -Type Directory -Path $destPath -Force | Out-Null    

    $svgFilesParsed = @()
    foreach ($svgFile in $svgFilesRaw) {       
        $obj = [PSCustomObject]@{
            FullName = $svgFile
            FileName = $svgFile.Split("\")[-1]
        }

        $obj.FileName -match "(.*).svg" | Out-Null

        $obj | Add-Member -MemberType NoteProperty -Name "BaseName" -Value "$($Matches[1])"
        $obj | Add-Member -MemberType NoteProperty -Name "Name" -Value ("$($obj.BaseName).svg")        

        $svgFilesParsed += $obj
    }

    $copiedFiles = @()

    $svgFilesParsed | Group-Object -Property BaseName | ForEach-Object {
        if ($_.Count -eq 1) {
            Write-Output "    Copy $($_.Group[0].FullName) as $($_.Group[0].Name)  ..."
            Copy-Item -Path $_.Group[0].FullName -Destination (Join-Path $destPath $_.Group[0].Name) -Force
        }
        else {
            $obj = $_.Group | Select-Object -First 1

            Write-Output "    Copy $($obj.FullName) as $($obj.Name)  ..."
            Copy-Item -Path $obj.FullName -Destination (Join-Path $destPath $obj.Name) -Force
        }
        $copiedFiles += $_.Name
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

    $copiedFiles = $copiedFiles | Sort-Object
    
    $iconsJson | Add-Member -MemberType NoteProperty -Name "M365" -Value $copiedFiles -Force | Out-Null
    $iconsJson | ConvertTo-Json -Depth 100 | Out-File $iconsJSONPath -Force

    Write-Output "Done"
}

function DownloadD365Icons {
    Write-Output "------ Dynamics 365 ------"
    $zipPath = join-path $tempPath "D365.zip"
    $extractPath = join-path $tempPath "D365"
    $destPath = join-path $iconsPath "D365"

    Write-Output "Download..."
    Invoke-WebRequest -Uri "https://download.microsoft.com/download/3/e/a/3eaa9444-906f-468d-92cb-ada53e87b977/Dynamics_365_Icons_scalable.zip" -OutFile $zipPath
    Write-Output "Done"

    Write-Output "Extract..."
    New-Item -Type Directory -Path $extractPath -Force | Out-Null
    Expand-Archive -Path $zipPath -DestinationPath $extractPath -Force
    Write-Output "Done"

    Write-Output "Edit..."
    $svgFilesRaw = Get-ChildItem $extractPath -Recurse | `
        Select-Object -ExpandProperty FullName | `
        Where-Object { $_.EndsWith(".svg") }

    foreach ($icon in $svgFilesRaw) {
        Write-Output "    Editing  $($icon) ..."

        $iconSVG = Get-Content -Path $icon -Raw

        $title = [System.IO.Path]::GetFileNameWithoutExtension($icon)

        $iconSVG = $iconSVG -replace '(clip\d)', "`$1-$title"
        $iconSVG = $iconSVG -replace '(mask\d)', "`$1-$title"
        $iconSVG = $iconSVG -replace '(filter\d_f)', "`$1-$title"
        $iconSVG = $iconSVG -replace '(paint\d_linear)', "`$1-$title"
        
        $iconSVG | Set-Content -Path $icon -Force
    }
    Write-Output "Done"

    Write-Output "Copy :"
    New-Item -Type Directory -Path $destPath -Force | Out-Null

    # filtering the lowest resolution icons
    $svgFilesParsed = @()
    foreach ($svgFile in $svgFilesRaw) {       
        $obj = [PSCustomObject]@{
            FullName = $svgFile
            FileName = $svgFile.Split("\")[-1]
        }

        $obj.FileName -match "(.*)_?_scalable.svg" | Out-Null

        $obj | Add-Member -MemberType NoteProperty -Name "BaseName" -Value "$($Matches[1])"
        $obj | Add-Member -MemberType NoteProperty -Name "Name" -Value ("$($obj.BaseName).svg")        

        $svgFilesParsed += $obj
    }

    $copiedFiles = @()

    $svgFilesParsed | Group-Object -Property BaseName | ForEach-Object {
        if ($_.Count -eq 1) {
            Write-Output "    Copy $($_.Group[0].FullName) as $($_.Group[0].Name)  ..."
            Copy-Item -Path $_.Group[0].FullName -Destination (Join-Path $destPath $_.Group[0].Name) -Force
        }
        else {
            $obj = $_.Group | Select-Object -First 1

            Write-Output "    Copy $($obj.FullName) as $($obj.Name)  ..."
            Copy-Item -Path $obj.FullName -Destination (Join-Path $destPath $obj.Name) -Force
        }
        $copiedFiles += $_.Name
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

    $copiedFiles = $copiedFiles | Sort-Object
    
    $iconsJson | Add-Member -MemberType NoteProperty -Name "D365" -Value $copiedFiles -Force | Out-Null
    $iconsJson | ConvertTo-Json -Depth 100 | Out-File $iconsJSONPath -Force

    Write-Output "Done"
}

function DownloadPowerPlatformIcons {
    Write-Output "------ Power Platform ------"
    $zipPath = join-path $tempPath "PowerPlatform.zip"
    $extractPath = join-path $tempPath "PowerPlatform"
    $destPath = join-path $iconsPath "PowerPlatform"

    Write-Output "Download..."
    Invoke-WebRequest -Uri "https://download.microsoft.com/download/e/f/4/ef434e60-8cdc-4dd1-9d9f-e58670e57ec1/Power_Platform_scalable.zip" -OutFile $zipPath
    Write-Output "Done"

    Write-Output "Extract..."
    New-Item -Type Directory -Path $extractPath -Force | Out-Null
    Expand-Archive -Path $zipPath -DestinationPath $extractPath -Force
    Write-Output "Done"
    
    Write-Output "Edit..."
    $svgFilesRaw = Get-ChildItem $extractPath -Recurse | `
        Select-Object -ExpandProperty FullName | `
        Where-Object { $_.EndsWith(".svg") }

    foreach ($icon in $svgFilesRaw) {
        Write-Output "    Editing  $($icon) ..."

        $iconSVG = Get-Content -Path $icon -Raw

        $title = [System.IO.Path]::GetFileNameWithoutExtension($icon)

        $iconSVG = $iconSVG -replace '(clip\d)', "`$1-$title"
        $iconSVG = $iconSVG -replace '(mask\d(?:[_\d]*))', "`$1-$title"
        $iconSVG = $iconSVG -replace '(filter\d_f(?:[_\d]*))', "`$1-$title"
        $iconSVG = $iconSVG -replace '(paint\d_linear(?:[_\d]*))', "`$1-$title"
        
        $iconSVG | Set-Content -Path $icon -Force
    }
    Write-Output "Done"
    
    Write-Output "Copy :"
    New-Item -Type Directory -Path $destPath -Force | Out-Null

    # filtering the lowest resolution icons
    $svgFilesParsed = @()
    foreach ($svgFile in $svgFilesRaw) {       
        $obj = [PSCustomObject]@{
            FullName = $svgFile
            FileName = $svgFile.Split("\")[-1]
        }

        $obj.FileName -match "(.*)_scalable.svg" | Out-Null

        $obj | Add-Member -MemberType NoteProperty -Name "BaseName" -Value "$($Matches[1])"
        $obj | Add-Member -MemberType NoteProperty -Name "Name" -Value ("$($obj.BaseName).svg")        

        $svgFilesParsed += $obj
    }

    $copiedFiles = @()

    $svgFilesParsed | Group-Object -Property BaseName | ForEach-Object {
        if ($_.Count -eq 1) {
            Write-Output "    Copy $($_.Group[0].FullName) as $($_.Group[0].Name)  ..."
            Copy-Item -Path $_.Group[0].FullName -Destination (Join-Path $destPath $_.Group[0].Name) -Force
        }
        else {
            $obj = $_.Group | Select-Object -First 1

            Write-Output "    Copy $($obj.FullName) as $($obj.Name)  ..."
            Copy-Item -Path $obj.FullName -Destination (Join-Path $destPath $obj.Name) -Force
        }
        $copiedFiles += $_.Name
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

    $copiedFiles = $copiedFiles | Sort-Object
    
    $iconsJson | Add-Member -MemberType NoteProperty -Name "PowerPlatform" -Value $copiedFiles -Force | Out-Null
    $iconsJson | ConvertTo-Json -Depth 100 | Out-File $iconsJSONPath -Force

    Write-Output "Done"
}

function DownloadGCPIcons {
    Write-Output "------ GCP ------"
    $zipPath = join-path $tempPath "GCP.zip"
    $extractPath = join-path $tempPath "GCP"
    $destPath = join-path $iconsPath "GCP"

    Write-Output "Download..."
    Invoke-WebRequest -Uri "https://cloud.google.com/static/icons/files/google-cloud-icons.zip" -OutFile $zipPath
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

        $obj.FileName -match "(.*).svg" | Out-Null

        $obj | Add-Member -MemberType NoteProperty -Name "BaseName" -Value "$($Matches[1])"
        $obj | Add-Member -MemberType NoteProperty -Name "Name" -Value ("$($obj.BaseName).svg")        

        $svgFilesParsed += $obj
    }

    $copiedFiles = @()

    foreach ($svgFileParsed in $svgFilesParsed) {
        Write-Output "    Copy $($svgFileParsed.FullName) as $($svgFileParsed.Name) ..."
        Copy-Item -Path $svgFileParsed.FullName -Destination (Join-Path $destPath $svgFileParsed.Name) -Force

        $copiedFiles += $svgFileParsed.BaseName
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
    
    $iconsJson | Add-Member -MemberType NoteProperty -Name "GCP" -Value $copiedFiles -Force | Out-Null
    $iconsJson | ConvertTo-Json -Depth 100 | Out-File $iconsJSONPath -Force

    Write-Output "Done"
}

function DownloadCiscoIcons {
    Write-Output "------ Cisco ------"
    $sourcePath = join-path $vendorsPath "Cisco"
    $extractPath = join-path $tempPath "Cisco"
    $destPath = join-path $iconsPath "Cisco"

    Write-Output "Local copy..."
    Copy-Item -Path $sourcePath -Destination $tempPath -Force -Recurse
    Write-Output "Done"

    Write-Output "Edit Icons :"
    $icons = Get-ChildItem -Recurse -Path $extractPath | `
        Where-Object { $_.Name.EndsWith(".svg") } 
        
    foreach ($icon in $icons) {
        Write-Output "    Editing  $($icon.FullName) ..."

        $iconSVG = Get-Content -Path $icon.FullName -Raw

        $iconSVG = $iconSVG -replace 'transform=" scale([\d\.]*) "', ""
        $iconSVG = $iconSVG -replace ' transform=" ?translate\([-\d\.]*, ?[-\d\.]*\) ?\"', ""
        #$iconSVG = $iconSVG -replace 'stroke-width="[\d\.]*(?:px)?"', "stroke-width=""0.5"""
        

        $points = ([regex]"([-\d\.]*), ?([-\d\.]*)").Matches($iconSVG) | Select-Object @{label="X"; expression={$_.Groups[1].Value}},@{label="Y"; expression={$_.Groups[2].Value}}

        $minX = $points | Select-Object -ExpandProperty X | Measure-Object -Minimum | Select-Object -ExpandProperty Minimum
        $minY = $points | Select-Object -ExpandProperty Y | Measure-Object -Minimum | Select-Object -ExpandProperty Minimum

        foreach ($point in $points) {
            $newX = $point.X - $minX
            $newY = $point.Y - $minY

            $iconSVG = $iconSVG -replace "$($point.X),$($point.Y)", "$newX,$newY"
        }

        $points = ([regex]"([-\d\.]*), ?([-\d\.]*)").Matches($iconSVG) | Select-Object @{label="X"; expression={$_.Groups[1].Value}},@{label="Y"; expression={$_.Groups[2].Value}}

        $maxX = $points | Select-Object -ExpandProperty X | Measure-Object -Maximum | Select-Object -ExpandProperty Maximum
        $maxY = $points | Select-Object -ExpandProperty Y | Measure-Object -Maximum | Select-Object -ExpandProperty Maximum

        $iconSVG = $iconSVG -replace 'width="[\d\.]*" height="[\d\.]*"', "viewBox=""0 0 $maxX $maxY"" width=""$maxX"" height=""$maxY"""

        $iconSVG | Set-Content -Path $icon.FullName -Force
    }

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

        $obj.FileName -match "(.*).svg" | Out-Null

        $obj | Add-Member -MemberType NoteProperty -Name "BaseName" -Value "$($Matches[1])"
        $obj | Add-Member -MemberType NoteProperty -Name "Name" -Value ("$($obj.BaseName).svg")        

        $svgFilesParsed += $obj
    }

    $copiedFiles = @()

    foreach ($svgFileParsed in $svgFilesParsed) {
        Write-Output "    Copy $($svgFileParsed.FullName) as $($svgFileParsed.Name) ..."
        Copy-Item -Path $svgFileParsed.FullName -Destination (Join-Path $destPath $svgFileParsed.Name) -Force

        $copiedFiles += $svgFileParsed.BaseName
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
    
    $iconsJson | Add-Member -MemberType NoteProperty -Name "Cisco" -Value $copiedFiles -Force | Out-Null
    $iconsJson | ConvertTo-Json -Depth 100 | Out-File $iconsJSONPath -Force

    Write-Output "Done"
}

function CopySrc {
    Write-Output "====== Copying sources content ======"
    Copy-Item -Path "$srcPath/*" -Destination $buildPath -Recurse -Force
}

function InitCleanup {
    Write-Output "====== Cleaning dist ======"
    Remove-Item -Path $buildPath -Recurse -Force -ErrorAction SilentlyContinue
}

function EndCleanup {
    Write-Output "====== Cleaning tmp ======"
    Remove-Item -Path $tempPath -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Output "Starting DrawTheNet build process..."

#InitCleanup
#DownloadIcons
CopySrc
#EndCleanup

Write-Output "All Done"