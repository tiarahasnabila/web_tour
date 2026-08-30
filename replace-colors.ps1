$files = @(
  'src\pages\index.astro',
  'src\pages\layanan.astro',
  'src\pages\tentang-kami.astro',
  'src\pages\kontak.astro',
  'src\pages\galeri.astro',
  'src\pages\tour-package\index.astro',
  'src\components\Footer.astro',
  'src\components\FloatingContact.astro'
)

foreach ($file in $files) {
  $content = [System.IO.File]::ReadAllText($file)
  $content = $content.Replace('accent-dark', 'navy-900')
  $content = $content.Replace('accent-mid', 'navy-800')
  $content = $content.Replace('accent-light', 'navy-700')
  [System.IO.File]::WriteAllText($file, $content)
  Write-Host "Updated: $file"
}
Write-Host "All done!"
