# =============================================================================
# LXD360 Avatar Processing Pipeline
# Windows-Safe Blender Launcher
# =============================================================================

param(
    [string]$Model = "cortex"
)

# Configuration
$BlenderPath = "C:\Program Files\Blender Foundation\Blender 5.0\blender.exe"
$ScriptPath = "apps/web/scripts/blender/merge_animations.py"
$MasterPath = "apps/web/scripts/blender/raw/${Model}_master.blend"
$AnimsPath = "apps/web/scripts/blender/raw/animations/"
$OutputPath = "apps/web/public/models/${Model}.glb"

# Banner
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  LXD360 Avatar Processing Pipeline" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Check Blender exists
if (-not (Test-Path $BlenderPath)) {
    Write-Host "ERROR: Blender not found at:" -ForegroundColor Red
    Write-Host "  $BlenderPath" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please install Blender 5.0 or update the path in this script." -ForegroundColor Gray
    exit 1
}

# Check master file exists
if (-not (Test-Path $MasterPath)) {
    Write-Host "ERROR: Master blend file not found:" -ForegroundColor Red
    Write-Host "  $MasterPath" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please save your rigged character as: ${Model}_master.blend" -ForegroundColor Gray
    exit 1
}

# Display configuration
Write-Host "Configuration:" -ForegroundColor White
Write-Host "  Blender:  $BlenderPath" -ForegroundColor Gray
Write-Host "  Model:    $Model" -ForegroundColor Gray
Write-Host "  Master:   $MasterPath" -ForegroundColor Gray
Write-Host "  Anims:    $AnimsPath" -ForegroundColor Gray
Write-Host "  Output:   $OutputPath" -ForegroundColor Gray
Write-Host ""

# Count animation files
$AnimCount = (Get-ChildItem -Path $AnimsPath -Filter "*.fbx" -ErrorAction SilentlyContinue | Measure-Object).Count
Write-Host "Found $AnimCount animation file(s)" -ForegroundColor White
Write-Host ""

# Execute Blender (& operator handles paths with spaces correctly)
Write-Host "Starting Blender..." -ForegroundColor Cyan
Write-Host "------------------------------------------------------------" -ForegroundColor DarkGray

& $BlenderPath --background --python $ScriptPath -- --master $MasterPath --anims $AnimsPath --output $OutputPath

$ExitCode = $LASTEXITCODE

Write-Host "------------------------------------------------------------" -ForegroundColor DarkGray
Write-Host ""

# Check result
if ($ExitCode -eq 0) {
    if (Test-Path $OutputPath) {
        $FileSize = (Get-Item $OutputPath).Length / 1KB
        Write-Host "SUCCESS!" -ForegroundColor Green
        Write-Host "  Output: $OutputPath" -ForegroundColor White
        Write-Host "  Size:   $([math]::Round($FileSize, 1)) KB" -ForegroundColor Gray
    } else {
        Write-Host "WARNING: Blender exited OK but output file not found" -ForegroundColor Yellow
    }
} else {
    Write-Host "FAILED with exit code $ExitCode" -ForegroundColor Red
    exit $ExitCode
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
