@echo off
REM =============================================================================
REM LXD360 Cloud Run Deployment Script (Windows)
REM =============================================================================
REM Usage: deploy-cloud-run.bat
REM =============================================================================

setlocal enabledelayedexpansion

REM Configuration
set PROJECT_ID=lxd-saas-dev
set REGION=us-central1
set SERVICE_NAME=lxd360-app
set MIN_INSTANCES=1
set MAX_INSTANCES=10
set MEMORY=2Gi
set CPU=2

echo =========================================
echo   LXD360 Cloud Run Deployment
echo =========================================
echo.

REM Check gcloud is installed
where gcloud >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Error: gcloud CLI is not installed
    echo Install from: https://cloud.google.com/sdk/docs/install
    exit /b 1
)

REM Set project
echo Setting project to %PROJECT_ID%...
call gcloud config set project %PROJECT_ID%

REM Navigate to script directory
cd /d "%~dp0"

echo.
echo Building and deploying to Cloud Run...
echo   Project:   %PROJECT_ID%
echo   Region:    %REGION%
echo   Service:   %SERVICE_NAME%
echo   Memory:    %MEMORY%
echo   CPU:       %CPU%
echo   Instances: %MIN_INSTANCES%-%MAX_INSTANCES%
echo.

REM Deploy using Cloud Build + Cloud Run
call gcloud run deploy %SERVICE_NAME% ^
  --source . ^
  --region %REGION% ^
  --platform managed ^
  --allow-unauthenticated ^
  --port 3000 ^
  --memory %MEMORY% ^
  --cpu %CPU% ^
  --min-instances %MIN_INSTANCES% ^
  --max-instances %MAX_INSTANCES% ^
  --set-env-vars "NODE_ENV=production" ^
  --set-env-vars "NEXT_PUBLIC_CLOUD_RUN=true" ^
  --timeout 300 ^
  --concurrency 80

if %ERRORLEVEL% neq 0 (
    echo.
    echo Deployment failed!
    exit /b 1
)

echo.
echo =========================================
echo   Deployment Complete!
echo =========================================
echo.

REM Get service URL
for /f "tokens=*" %%i in ('gcloud run services describe %SERVICE_NAME% --region %REGION% --format "value(status.url)"') do set SERVICE_URL=%%i

echo Service URL: %SERVICE_URL%
echo.
echo Next steps:
echo   1. Test the deployment: curl %SERVICE_URL%/api/health
echo   2. Configure custom domain in Cloud Console
echo   3. Set up Stripe webhook: %SERVICE_URL%/api/webhooks/stripe
echo.

endlocal
