$files = Get-ChildItem -Path "c:\web_tour\src" -Recurse -Include "*.astro", "*.ts"
foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    if ($content -match "Hati Tour and Transport") {
        $content = $content.Replace("Hati Tour and Transport", "Beyond Jogja Tours")
        [System.IO.File]::WriteAllText($file.FullName, $content)
        Write-Host "Updated $($file.FullName)"
    }
}
Write-Host "Done!"
