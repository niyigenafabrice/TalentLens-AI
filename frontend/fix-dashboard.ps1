$file = "C:\Users\lenovo\Desktop\HRCompetition\frontend\src\app\dashboard\page.tsx"
$content = Get-Content $file -Raw -Encoding UTF8

# Fix jobId filter - simple string match
$content = $content -replace 'const filteredApplicants = selectedJobId \? applicants\.filter\(\(a\) => \{[\s\S]*?\}\) : applicants;', 'const filteredApplicants = selectedJobId ? applicants.filter((a) => String(a.jobId) === selectedJobId) : applicants;'

# Fix donut center to show filtered count
$content = $content -replace '\{applicants\.length\}(?=.*Total Applicants)', '{filteredApplicants.length}'

Set-Content $file $content -Encoding UTF8
Write-Host "Done!"
