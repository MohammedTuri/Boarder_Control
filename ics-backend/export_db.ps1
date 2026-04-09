# ICS Database Export Utility
# Usage: .\export_db.ps1

$DB_NAME = "ics_db"
$DB_USER = "postgres"
$EXPORT_FILE = "ics_db_backup_$(Get-Date -Format 'yyyyMMdd_HHmm').sql"

Write-Host "--- Initiating Sovereign Data Export ---" -ForegroundColor Cyan

# Attempt to find pg_dump
$PG_DUMP = "pg_dump"
if (!(Get-Command $PG_DUMP -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: pg_dump not found in PATH." -ForegroundColor Red
    Write-Host "Please ensure PostgreSQL bin folder is in your System PATH." -ForegroundColor Yellow
    exit
}

Write-Host "Exporting $DB_NAME to $EXPORT_FILE..." -ForegroundColor Gray
& $PG_DUMP -U $DB_USER -d $DB_NAME -f $EXPORT_FILE -p 5433

if ($LASTEXITCODE -eq 0) {
    Write-Host "Success! Data persistent in $EXPORT_FILE" -ForegroundColor Green
} else {
    Write-Host "Export failed. Status code: $LASTEXITCODE" -ForegroundColor Red
}
